import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  const days = 30;
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

  const series = dates.map((date, i) => ({
    date: `${date}T00:00:00.000Z`,
    unique_visitors: visitors[i] ?? 0,
    total_sessions: sessions[i] ?? 0,
  }));

  return Response.json({
    summary: {
      unique_visitors: series.reduce((s, d) => s + d.unique_visitors, 0),
      total_sessions: series.reduce((s, d) => s + d.total_sessions, 0),
    },
    series,
    startDate: dates[0]!,
    endDate: dates[dates.length - 1]!,
  });
}
