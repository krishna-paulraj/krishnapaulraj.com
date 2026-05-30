import { unstable_cache } from "next/cache";

import { redis } from "@/lib/redis";

export type InsightsSeries = {
  date: string;
  unique_visitors: number;
  total_sessions: number;
};

export type InsightsData = {
  summary: {
    unique_visitors: number;
    total_sessions: number;
  };
  series: InsightsSeries[];
  startDate: string;
  endDate: string;
};

export const getCachedInsights = unstable_cache(
  async (days = 30): Promise<InsightsData> => {
    const today = new Date();
    const dates = Array.from({ length: days }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (days - 1 - i));
      return d.toISOString().slice(0, 10);
    });

    const visitorKeys = dates.map((d) => `visitors:daily:${d}`);
    const sessionKeys = dates.map((d) => `sessions:daily:${d}`);

    const [visitors, sessions] = await Promise.all([
      redis.mget<(number | null)[]>(...visitorKeys),
      redis.mget<(number | null)[]>(...sessionKeys),
    ]);

    const series: InsightsSeries[] = dates.map((date, i) => ({
      date: `${date}T00:00:00.000Z`,
      unique_visitors: visitors[i] ?? 0,
      total_sessions: sessions[i] ?? 0,
    }));

    return {
      summary: {
        unique_visitors: series.reduce((s, d) => s + d.unique_visitors, 0),
        total_sessions: series.reduce((s, d) => s + d.total_sessions, 0),
      },
      series,
      startDate: dates[0]!,
      endDate: dates[dates.length - 1]!,
    };
  },
  ["site-insights"],
  { revalidate: 3600 },
);
