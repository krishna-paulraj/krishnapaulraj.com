"use client";

import { useEffect, useState } from "react";

import type { Activity } from "@/components/sections/contribution-graph";
import {
  GitHubContributions,
  GitHubContributionsFallback,
} from "@/components/sections/github-contributions";

export function GithubActivity() {
  const [data, setData] = useState<Activity[] | null>(null);

  useEffect(() => {
    fetch("/api/contributions")
      .then((r) => r.json())
      .then((d: { contributions?: Activity[] }) =>
        setData(d.contributions ?? []),
      )
      .catch(() => {});
  }, []);

  return (
    <div className="-mt-2.5 w-full overflow-x-auto overflow-y-hidden">
      {data === null ? (
        <GitHubContributionsFallback />
      ) : (
        <GitHubContributions data={data} className="text-xs" />
      )}
    </div>
  );
}
