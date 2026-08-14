"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import {
  Filters,
  type Filter,
  type FilterFieldConfig,
} from "@/components/reui/filters";

type BlogFiltersProps = {
  tags: { tag: string; count: number }[];
  activeTags: string[];
};

/**
 * ReUI Filters wired to the URL: selected tags live in `?tag=` params, so
 * filtered views stay linkable and the server component does the filtering.
 */
export function BlogFilters({ tags, activeTags }: BlogFiltersProps) {
  const router = useRouter();

  const fields = useMemo<FilterFieldConfig<string>[]>(
    () => [
      {
        key: "tag",
        label: "Tag",
        type: "multiselect",
        // The URL only encodes inclusion, so the negating operators the
        // component would otherwise offer are off the menu.
        operators: [{ value: "is_any_of", label: "is any of" }],
        defaultOperator: "is_any_of",
        options: tags.map(({ tag, count }) => ({
          value: tag,
          label: `#${tag} (${count})`,
        })),
      },
    ],
    [tags],
  );

  // Built literally rather than with createFilter(): its random ids would
  // differ between server render and hydration.
  const filters = useMemo<Filter<string>[]>(
    () =>
      activeTags.length > 0
        ? [
            {
              id: "tag",
              field: "tag",
              operator: "is_any_of",
              values: activeTags,
            },
          ]
        : [],
    [activeTags],
  );

  const handleChange = (next: Filter<string>[]) => {
    const params = new URLSearchParams();
    for (const filter of next) {
      if (filter.field !== "tag") continue;
      for (const value of filter.values) params.append("tag", String(value));
    }
    const query = params.toString();
    router.push(query ? `/blog?${query}` : "/blog", { scroll: false });
  };

  return (
    <Filters
      filters={filters}
      fields={fields}
      onChange={handleChange}
      allowMultiple={false}
      showSearchInput={false}
      size="sm"
    />
  );
}
