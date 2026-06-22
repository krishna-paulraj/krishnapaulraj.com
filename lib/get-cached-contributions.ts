import { unstable_cache } from "next/cache"

import type { Activity } from "@/components/sections/contribution-graph"

type GitHubContributionsResponse = {
  contributions: Activity[]
}

export const getCachedContributions = (username: string) =>
  unstable_cache(
    async () => {
      const res = await fetch(
        `${process.env.GITHUB_CONTRIBUTIONS_API_URL || `https://github-contributions-api.jogruber.de`}/v4/${username}?y=last`
      )
      const data = (await res.json()) as GitHubContributionsResponse
      return data.contributions
    },
    [`github-contributions-${username}`],
    { revalidate: 86400 }
  )()
