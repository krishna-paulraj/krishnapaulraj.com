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
