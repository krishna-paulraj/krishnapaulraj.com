/**
 * Central re-export of shared domain types.
 *
 * Types are defined alongside their data modules in `lib/` (single source of
 * truth) and surfaced here for convenient `@/types` imports.
 */
export type {
  Project,
  ProjectLink,
  ProjectStatus,
  ProjectTech,
  TechKey,
} from "@/lib/projects";
export type { BlogPost, BlogPostDetail } from "@/lib/blog";
export type { BoardCard, BoardColumnId, BoardState } from "@/lib/board";

/**
 * Site analytics served by `app/api/insights/route.ts` and fetched
 * client-side by the homepage insights section.
 */
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
