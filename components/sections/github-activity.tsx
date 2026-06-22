import { Suspense } from "react";

import { getCachedContributions } from "@/lib/get-cached-contributions";
import {
  GitHubContributions,
  GitHubContributionsFallback,
} from "@/components/sections/github-contributions";

const GITHUB_USERNAME = "suresh-krishna-paulraj-1032";

export function GithubActivity() {
  const contributions = getCachedContributions(GITHUB_USERNAME);

  return (
    <div className="-mt-2.5 w-full overflow-x-auto overflow-y-hidden">
      <Suspense fallback={<GitHubContributionsFallback />}>
        <GitHubContributions contributions={contributions} className="text-xs" />
      </Suspense>
    </div>
  );
}
