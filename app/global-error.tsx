"use client";

// Catches errors thrown by the root layout itself, which app/error.tsx cannot.
// Renders its own <html>/<body> and stays dependency-free on purpose — if the
// root layout failed, globals.css and the provider stack may be unavailable.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          margin: 0,
        }}
      >
        <div style={{ maxWidth: "28rem", padding: "1.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Something broke</h1>
          <p style={{ color: "#666", lineHeight: 1.6 }}>
            The site hit an unexpected error before it could render. Retrying
            usually fixes it.
          </p>
          {error.digest && (
            <p style={{ color: "#999", fontFamily: "monospace", fontSize: 12 }}>
              Reference: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => reset()}
            style={{
              border: "1px solid #ccc",
              borderRadius: 8,
              background: "transparent",
              padding: "0.4rem 0.9rem",
              cursor: "pointer",
              font: "inherit",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
