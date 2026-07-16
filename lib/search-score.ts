export type SearchKind = "page" | "post" | "project";

export type SearchItem = {
  id: string;
  title: string;
  description?: string;
  href: string;
  kind: SearchKind;
  keywords?: string[];
};

function fuzzyScore(haystack: string, query: string): number {
  if (!query) return 1;
  const h = haystack.toLowerCase();
  const q = query.toLowerCase();

  if (h === q) return 1000;
  if (h.startsWith(q)) return 700 - (h.length - q.length);

  const idx = h.indexOf(q);
  if (idx >= 0) return 500 - idx;

  let hi = 0;
  let qi = 0;
  let gap = 0;
  let consecutive = 0;
  let maxConsec = 0;
  while (hi < h.length && qi < q.length) {
    if (h[hi] === q[qi]) {
      qi++;
      consecutive++;
      if (consecutive > maxConsec) maxConsec = consecutive;
    } else {
      consecutive = 0;
      gap++;
    }
    hi++;
  }
  if (qi < q.length) return 0;
  // Clamp: sparse matches in long haystacks can push this negative, and
  // callers filter on `score > 0` — a genuine match must stay positive.
  return Math.max(1, 200 + maxConsec * 8 - gap);
}

export function scoreItem(item: SearchItem, query: string): number {
  if (!query) return 1;
  const titleScore = fuzzyScore(item.title, query) * 3;
  const descScore = item.description ? fuzzyScore(item.description, query) : 0;
  const kwScore = item.keywords
    ? Math.max(0, ...item.keywords.map((k) => fuzzyScore(k, query) * 2))
    : 0;
  return Math.max(titleScore, descScore, kwScore);
}
