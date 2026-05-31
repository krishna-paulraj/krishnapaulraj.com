"use client";

import { format } from "date-fns";
import { useEffect, useState } from "react";

import type { InsightsData } from "@/lib/get-cached-insights";
import Grid from "@/components/charts/grid";
import LineChart, { Line } from "@/components/charts/line-chart";
import { ChartTooltip } from "@/components/charts/tooltip";
import HighlightedHeading from "./highlighted-heading";

export function Metrics01() {
  const [data, setData] = useState<InsightsData | null>(null);

  useEffect(() => {
    fetch("/api/insights")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 pb-6 font-sans">
      <div className="mt-5 w-full border-t pt-5">
        <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
        <HighlightedHeading className="my-4">
          Thank you for visiting
        </HighlightedHeading>

        {data === null ? (
          <>
            <div className="mt-1 h-4 w-32 animate-pulse rounded bg-muted" />
            <dl className="mt-4 grid grid-cols-2 gap-3">
              {["Unique Visitors", "Sessions"].map((label) => (
                <div
                  key={label}
                  className="rounded-lg border border-border bg-card/40 p-4"
                >
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <div className="mt-1 h-7 w-12 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </dl>
            <div className="mt-4 grid aspect-3/1 w-full place-content-center">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            </div>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              {format(new Date(data.startDate), "MMM d")}
              {" – "}
              {format(new Date(data.endDate), "MMM d, yyyy")}
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: "Unique Visitors", value: data.summary.unique_visitors },
                { label: "Sessions", value: data.summary.total_sessions },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-lg border border-border bg-card/40 p-4"
                >
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-1 text-xl font-semibold tabular-nums">
                    {value.toLocaleString()}
                  </dd>
                </div>
              ))}
            </dl>

            {data.series.some(
              (d) => d.unique_visitors > 0 || d.total_sessions > 0,
            ) ? (
              <LineChart
                className="mt-4"
                data={data.series}
                margin={{ top: 16, right: 0, bottom: 40, left: 0 }}
              >
                <Grid horizontal />
                <Line
                  dataKey="total_sessions"
                  stroke="var(--chart-line-secondary)"
                  strokeWidth={2}
                />
                <Line
                  dataKey="unique_visitors"
                  stroke="var(--chart-line-primary)"
                  strokeWidth={2}
                />
                <ChartTooltip
                  rows={(point) => [
                    {
                      color: "var(--chart-line-secondary)",
                      label: "Sessions",
                      value: point.total_sessions as number,
                    },
                    {
                      color: "var(--chart-line-primary)",
                      label: "Unique Visitors",
                      value: point.unique_visitors as number,
                    },
                  ]}
                />
              </LineChart>
            ) : (
              <div className="mt-4 grid aspect-3/1 w-full place-content-center">
                <p className="text-sm text-muted-foreground">
                  No data yet — check back after some visits.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
