import type { Activity } from "@/components/sections/contribution-graph";

// Fetched server-side and cached here so the client can load it with a
// skeleton — mirrors the /api/insights pattern (unstable_cache proved
// unreliable when this ran inside the client component tree in Next 16).
// Intentionally different from the profile linked elsewhere on the site
// (github.com/krishna-paulraj): the contribution activity lives on this
// account.
const GITHUB_USERNAME = "suresh-krishna-paulraj-1032";

type GitHubContributionsResponse = {
  contributions: Activity[];
};

// Next.js requires the `revalidate` segment export to be a static literal —
// it can't reference a variable — so the 24h value is inlined here and below.
export const revalidate = 86400;

export async function GET() {
  const base =
    process.env.GITHUB_CONTRIBUTIONS_API_URL ||
    "https://github-contributions-api.jogruber.de";

  try {
    const res = await fetch(`${base}/v4/${GITHUB_USERNAME}?y=last`, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return Response.json({ contributions: [] }, { status: 502 });
    }

    const data = (await res.json()) as GitHubContributionsResponse;
    return Response.json({ contributions: data.contributions ?? [] });
  } catch {
    // Network failure (including during build-time prerender) degrades to an
    // empty graph instead of throwing.
    return Response.json({ contributions: [] }, { status: 502 });
  }
}
