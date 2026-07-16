"use client";

import { useEffect, useState } from "react";

import type { Activity } from "@/components/sections/contribution-graph";
import {
  GitHubContributions,
  GitHubContributionsFallback,
  GitHubContributionsNotice,
} from "@/components/sections/github-contributions";

type ContributionsState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "loaded"; data: Activity[] };

export function GithubActivity() {
  const [state, setState] = useState<ContributionsState>({
    status: "loading",
  });

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/contributions", { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Contributions request failed: ${res.status}`);
        }
        // res.json() throws on malformed payloads and lands in catch below.
        const body = (await res.json()) as { contributions?: unknown };
        const contributions = Array.isArray(body?.contributions)
          ? (body.contributions as Activity[])
          : [];
        setState({ status: "loaded", data: contributions });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setState({ status: "error" });
        }
      });

    return () => controller.abort();
  }, []);

  return (
    <div className="-mt-2.5 w-full overflow-x-auto overflow-y-hidden">
      {state.status === "loading" ? (
        <GitHubContributionsFallback />
      ) : state.status === "error" || state.data.length === 0 ? (
        // Same-height notice: empty data would make ContributionGraph return
        // null and collapse the reserved block.
        <GitHubContributionsNotice>
          {state.status === "error"
            ? "Couldn’t load contributions."
            : "No contributions to show yet."}
        </GitHubContributionsNotice>
      ) : (
        <GitHubContributions data={state.data} className="text-xs" />
      )}
    </div>
  );
}
