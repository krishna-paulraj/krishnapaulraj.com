export function extractGitHubRepo(url: string): string | null {
  const match = url.match(/^https?:\/\/github\.com\/([^/]+\/[^/?#]+)/i);
  if (!match) return null;
  return match[1].replace(/\.git$/, "");
}

export async function getGitHubStars(repo: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      next: { revalidate: 3600 },
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!res.ok) return null;
    const data: { stargazers_count?: number } = await res.json();
    return typeof data.stargazers_count === "number"
      ? data.stargazers_count
      : null;
  } catch {
    return null;
  }
}
