import { describe, expect, it } from "vitest";

import { normalizeProviderProfile } from "@/lib/chat";
import { signChatSession, verifyChatSession } from "@/lib/chat-session";
import {
  buildAuthorizeUrl,
  callbackUrl,
  challengeFor,
  createState,
  createVerifier,
  enabledProviders,
  providerCredentials,
  resolveOrigin,
  safeReturnTo,
  signState,
  stateMatches,
  verifyState,
} from "@/lib/oauth";

const SECRET = "test-secret-not-used-anywhere-real";
const NOW = 1_760_000_000_000;

/** Built from char codes so this file itself stays plain ASCII. */
const CRLF = String.fromCharCode(13, 10);
const NUL = String.fromCharCode(0);

function state(over: Partial<ReturnType<typeof createState>> = {}) {
  return {
    ...createState({ provider: "github", returnTo: "/", now: NOW }),
    ...over,
  };
}

describe("safeReturnTo", () => {
  it("keeps ordinary same-site paths", () => {
    expect(safeReturnTo("/blog/some-post")).toBe("/blog/some-post");
    expect(safeReturnTo("/inbox/abc?x=1")).toBe("/inbox/abc?x=1");
  });

  it("refuses anything that leaves the site", () => {
    // The whole point: a link to our own domain that lands somewhere else
    // after a genuine sign-in is exactly what a phishing page wants.
    expect(safeReturnTo("https://evil.com")).toBe("/");
    expect(safeReturnTo("//evil.com")).toBe("/");
    // Browsers treat this as protocol-relative too, so a leading-slash check
    // on its own is not enough.
    expect(safeReturnTo("/\\evil.com")).toBe("/");
    expect(safeReturnTo("javascript:alert(1)")).toBe("/");
  });

  it("refuses header injection and oversized values", () => {
    expect(safeReturnTo("/ok" + CRLF + "Set-Cookie: a=b")).toBe("/");
    expect(safeReturnTo("/ok" + NUL)).toBe("/");
    expect(safeReturnTo(`/${"a".repeat(600)}`)).toBe("/");
  });

  it("refuses non-strings", () => {
    expect(safeReturnTo(undefined)).toBe("/");
    expect(safeReturnTo(42)).toBe("/");
    expect(safeReturnTo({ toString: () => "/x" })).toBe("/");
  });
});

describe("state signing", () => {
  it("round-trips a valid state", () => {
    const original = state();
    expect(verifyState(signState(original, SECRET), SECRET, NOW)).toEqual(
      original,
    );
  });

  it("rejects a tampered payload", () => {
    const signed = signState(state(), SECRET);
    const signature = signed.slice(signed.lastIndexOf(".") + 1);
    const forged = Buffer.from(
      JSON.stringify(state({ returnTo: "/somewhere-else" })),
      "utf8",
    ).toString("base64url");
    expect(verifyState(`${forged}.${signature}`, SECRET, NOW)).toBeNull();
  });

  it("rejects a different secret", () => {
    expect(verifyState(signState(state(), SECRET), "another", NOW)).toBeNull();
  });

  it("rejects an expired state", () => {
    // The expiry sits inside the MAC, so the holder cannot push it out.
    const signed = signState(state(), SECRET);
    expect(verifyState(signed, SECRET, NOW + 60 * 60 * 1000)).toBeNull();
  });

  it("rejects junk", () => {
    expect(verifyState(undefined, SECRET, NOW)).toBeNull();
    expect(verifyState("", SECRET, NOW)).toBeNull();
    expect(verifyState("no-dot", SECRET, NOW)).toBeNull();
    expect(verifyState(".sig", SECRET, NOW)).toBeNull();
  });

  it("refuses to hand back an unsafe returnTo even when correctly signed", () => {
    // Defence in depth: a signature proves we wrote it, not that it is safe.
    const parsed = verifyState(
      signState(state({ returnTo: "//evil.com" }), SECRET),
      SECRET,
      NOW,
    );
    expect(parsed?.returnTo).toBe("/");
  });
});

describe("stateMatches", () => {
  it("accepts the nonce it issued", () => {
    const s = state();
    expect(stateMatches(s, "github", s.nonce)).toBe(true);
  });

  it("rejects a missing or wrong nonce", () => {
    const s = state();
    expect(stateMatches(s, "github", null)).toBe(false);
    expect(stateMatches(s, "github", "something-else")).toBe(false);
  });

  it("rejects one provider's state replayed at another's callback", () => {
    const s = state();
    expect(stateMatches(s, "google", s.nonce)).toBe(false);
  });
});

describe("PKCE", () => {
  it("derives a stable S256 challenge", () => {
    // RFC 7636's own worked example.
    expect(challengeFor("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk")).toBe(
      "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    );
  });

  it("mints distinct verifiers", () => {
    expect(createVerifier()).not.toBe(createVerifier());
  });
});

describe("buildAuthorizeUrl", () => {
  it("carries the nonce, never the verifier, through the provider", () => {
    const s = state();
    const url = new URL(
      buildAuthorizeUrl({
        provider: "github",
        clientId: "abc",
        redirectUri: "https://example.com/api/auth/github/callback",
        state: s,
      }),
    );
    expect(url.origin + url.pathname).toBe(
      "https://github.com/login/oauth/authorize",
    );
    expect(url.searchParams.get("state")).toBe(s.nonce);
    expect(url.searchParams.get("code_challenge")).toBe(
      challengeFor(s.verifier),
    );
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    // Sending the verifier on this leg would defeat the entire point of PKCE.
    expect(url.toString()).not.toContain(s.verifier);
  });

  it("asks Google which account to use", () => {
    const url = new URL(
      buildAuthorizeUrl({
        provider: "google",
        clientId: "abc",
        redirectUri: "https://example.com/api/auth/google/callback",
        state: state({ provider: "google" }),
      }),
    );
    expect(url.searchParams.get("prompt")).toBe("select_account");
    expect(url.searchParams.get("scope")).toContain("email");
  });
});

describe("configuration", () => {
  it("treats a half-configured provider as absent", () => {
    expect(providerCredentials("github", { GITHUB_CLIENT_ID: "a" })).toBeNull();
    expect(
      providerCredentials("github", {
        GITHUB_CLIENT_ID: "a",
        GITHUB_CLIENT_SECRET: "b",
      }),
    ).toEqual({ clientId: "a", clientSecret: "b" });
  });

  it("offers nothing without a secret to sign sessions with", () => {
    expect(
      enabledProviders({ GITHUB_CLIENT_ID: "a", GITHUB_CLIENT_SECRET: "b" }),
    ).toEqual([]);
    expect(
      enabledProviders({
        AUTH_SECRET: "s",
        GITHUB_CLIENT_ID: "a",
        GITHUB_CLIENT_SECRET: "b",
      }),
    ).toEqual(["github"]);
  });

  it("never takes the callback origin from the request in production", () => {
    // The Host header is caller-supplied; reflecting it would let someone aim
    // the callback at their own site.
    expect(
      resolveOrigin("https://attacker.example/api/auth/github", {
        NODE_ENV: "production",
      }),
    ).toBe("https://krishnapaulraj.com");
    expect(
      resolveOrigin("http://localhost:3000/api/auth/github", {
        NODE_ENV: "development",
      }),
    ).toBe("http://localhost:3000");
    expect(
      resolveOrigin("http://localhost:3000/x", { AUTH_URL: "https://p.dev/" }),
    ).toBe("https://p.dev");
  });

  it("builds the callback path the provider must have registered", () => {
    expect(callbackUrl("https://krishnapaulraj.com", "google")).toBe(
      "https://krishnapaulraj.com/api/auth/google/callback",
    );
  });
});

describe("chat session cookie", () => {
  it("round-trips an identity id", () => {
    const signed = signChatSession("abc-123", SECRET, NOW);
    expect(verifyChatSession(signed, SECRET, NOW)).toBe("abc-123");
  });

  it("rejects a wrong secret, a tampered id, and an expired session", () => {
    const signed = signChatSession("abc-123", SECRET, NOW);
    expect(verifyChatSession(signed, "other", NOW)).toBeNull();
    expect(
      verifyChatSession(signed.replace("abc-123", "def-456"), SECRET, NOW),
    ).toBeNull();
    expect(
      verifyChatSession(signed, SECRET, NOW + 91 * 24 * 60 * 60 * 1000),
    ).toBeNull();
  });

  it("rejects junk", () => {
    expect(verifyChatSession(undefined, SECRET, NOW)).toBeNull();
    expect(verifyChatSession("a.b", SECRET, NOW)).toBeNull();
  });
});

describe("normalizeProviderProfile", () => {
  it("truncates rather than rejecting", () => {
    // Provider data arrives after a successful sign-in; failing the whole flow
    // over a long display name would be absurd.
    expect(
      normalizeProviderProfile({ name: "x".repeat(80) }).name,
    ).toHaveLength(40);
  });

  it("only trusts an email the provider verified", () => {
    expect(
      normalizeProviderProfile({ email: "A@B.com", emailVerified: true }),
    ).toMatchObject({ email: "a@b.com", emailVerified: true });
    expect(
      normalizeProviderProfile({ email: "a@b.com", emailVerified: false })
        .emailVerified,
    ).toBe(false);
    // Nothing to verify means nothing verified, whatever the flag claims.
    expect(
      normalizeProviderProfile({ email: null, emailVerified: true })
        .emailVerified,
    ).toBe(false);
  });

  it("refuses an avatar that isn't a plain https URL", () => {
    // It ends up in a src attribute, so a javascript: or data: value has no
    // business here even coming from a provider we trust.
    expect(
      normalizeProviderProfile({ avatarUrl: "javascript:alert(1)" }).avatarUrl,
    ).toBeNull();
    expect(
      normalizeProviderProfile({ avatarUrl: "data:image/png;base64,AAAA" })
        .avatarUrl,
    ).toBeNull();
    expect(
      normalizeProviderProfile({ avatarUrl: "https://a.example/x.png" })
        .avatarUrl,
    ).toBe("https://a.example/x.png");
  });

  it("treats an empty name as absent rather than as an empty string", () => {
    expect(normalizeProviderProfile({ name: "   " }).name).toBeNull();
    expect(normalizeProviderProfile({}).name).toBeNull();
  });
});
