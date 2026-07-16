"use client";

import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";

import type { InsightsData } from "@/types";
import Grid from "@/components/charts/grid";
import LineChart, { Line } from "@/components/charts/line-chart";
import { ChartTooltip } from "@/components/charts/tooltip";
import HighlightedHeading from "@/components/ui/highlighted-heading";
import { Reveal } from "@/components/motion/reveal";
import { ContactChat } from "./contact-chat";

type InsightsState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "loaded"; data: InsightsData };

/** Validate the API payload before trusting it — bad data must not render. */
function parseInsights(value: unknown): InsightsData | null {
  if (typeof value !== "object" || value === null) return null;
  const candidate = value as Partial<InsightsData>;
  const summary = candidate.summary;

  if (
    typeof summary !== "object" ||
    summary === null ||
    typeof summary.unique_visitors !== "number" ||
    typeof summary.total_sessions !== "number" ||
    !Array.isArray(candidate.series) ||
    typeof candidate.startDate !== "string" ||
    typeof candidate.endDate !== "string"
  ) {
    return null;
  }

  return candidate as InsightsData;
}

export function Metrics01() {
  const [state, setState] = useState<InsightsState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/insights", { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Insights request failed: ${res.status}`);
        }
        // res.json() throws on malformed JSON and lands in catch below.
        const insights = parseInsights(await res.json());
        if (!insights) {
          throw new Error("Malformed insights payload");
        }
        setState({ status: "loaded", data: insights });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setState({ status: "error" });
        }
      });

    return () => controller.abort();
  }, []);

  return (
    <div className="mx-auto w-full max-w-2xl px-3 pb-6 font-sans md:px-6">
      <div className="mt-5 w-full border-t pt-5">
        <h2 className="text-3xl font-bold tracking-tight">Insights</h2>
        <HighlightedHeading className="my-4">
          Thank you for visiting
        </HighlightedHeading>

        {state.status === "loading" ? (
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
            {/* aspect-2/1 matches LineChart's default ratio — no layout shift. */}
            <div className="mt-4 grid aspect-2/1 w-full place-content-center">
              <div className="bg-muted h-4 w-32 animate-pulse rounded" />
            </div>
          </>
        ) : state.status === "error" ? (
          <>
            <p className="text-muted-foreground mt-1 text-sm">
              Couldn’t load insights.
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3">
              {["Unique Visitors", "Sessions"].map((label) => (
                <div
                  key={label}
                  className="border-border bg-card/40 rounded-lg border p-4"
                >
                  <dt className="text-muted-foreground text-xs">{label}</dt>
                  <dd className="text-muted-foreground mt-1 text-xl font-semibold tabular-nums">
                    —
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 grid aspect-2/1 w-full place-content-center">
              <p className="text-muted-foreground text-sm">
                No data available right now — check back later.
              </p>
            </div>
          </>
        ) : (
          <>
            <p className="text-muted-foreground mt-1 text-sm">
              {/* parseISO keeps "YYYY-MM-DD" on the same calendar day in every
                  timezone; new Date() would shift a day west of UTC. */}
              {format(parseISO(state.data.startDate), "MMM d")}
              {" – "}
              {format(parseISO(state.data.endDate), "MMM d, yyyy")}
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-3">
              {[
                {
                  label: "Unique Visitors",
                  value: state.data.summary.unique_visitors,
                },
                { label: "Sessions", value: state.data.summary.total_sessions },
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

            {state.data.series.some(
              (d) => d.unique_visitors > 0 || d.total_sessions > 0,
            ) ? (
              <LineChart
                className="mt-4"
                data={state.data.series}
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
              <div className="mt-4 grid aspect-2/1 w-full place-content-center">
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
          <h2 className="text-3xl font-bold tracking-tight">Say hi</h2>
          <HighlightedHeading className="my-4">
            Let&apos;s connect and build something
          </HighlightedHeading>
          <ContactChat />
        </div>
      </Reveal>
    </div>
  );
}
