"use client";

import { format } from "date-fns";
import { useEffect, useState } from "react";

import type { InsightsData } from "@/lib/get-cached-insights";
import Grid from "@/components/charts/grid";
import LineChart, { Line } from "@/components/charts/line-chart";
import { ChartTooltip } from "@/components/charts/tooltip";
import HighlightedHeading from "@/components/ui/highlighted-heading";
import { Reveal } from "@/components/motion/reveal";
import { ContactChat } from "./contact-chat";

export function Metrics01() {
  const [data, setData] = useState<InsightsData | null>(null);

  useEffect(() => {
    fetch("/api/insights")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto w-full max-w-2xl px-3 pb-6 font-sans md:px-6">
      <div className="mt-5 w-full border-t pt-5">
        <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
        <HighlightedHeading className="my-4">
          Thank you for visiting
        </HighlightedHeading>

        {data === null ? (
          <>
            <div className="bg-muted mt-1 h-4 w-32 animate-pulse rounded" />
            <dl className="mt-4 grid grid-cols-2 gap-3">
              {["Unique Visitors", "Sessions"].map((label) => (
                <div
                  key={label}
                  className="border-border bg-card/40 rounded-lg border p-4"
                >
                  <dt className="text-muted-foreground text-xs">{label}</dt>
                  <div className="bg-muted mt-1 h-7 w-12 animate-pulse rounded" />
                </div>
              ))}
            </dl>
            <div className="mt-4 grid aspect-3/1 w-full place-content-center">
              <div className="bg-muted h-4 w-32 animate-pulse rounded" />
            </div>
          </>
        ) : (
          <>
            <p className="text-muted-foreground mt-1 text-sm">
              {format(new Date(data.startDate), "MMM d")}
              {" – "}
              {format(new Date(data.endDate), "MMM d, yyyy")}
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-3">
              {[
                {
                  label: "Unique Visitors",
                  value: data.summary.unique_visitors,
                },
                { label: "Sessions", value: data.summary.total_sessions },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="border-border bg-card/40 rounded-lg border p-4"
                >
                  <dt className="text-muted-foreground text-xs">{label}</dt>
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
                <p className="text-muted-foreground text-sm">
                  No data yet — check back after some visits.
                </p>
              </div>
            )}
          </>
        )}
      </div>
      <Reveal delay={0.48}>
        <div className="mt-5 w-full border-t pt-5">
          <h1 className="text-3xl font-bold tracking-tight">Say hi</h1>
          <HighlightedHeading className="my-4">
            Let&apos;s connect and build something
          </HighlightedHeading>
          <ContactChat />
        </div>
      </Reveal>
    </div>
  );
}
