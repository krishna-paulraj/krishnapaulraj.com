import {
  createHighlighter,
  type BundledLanguage,
  type Highlighter,
} from "shiki";

let highlighterPromise: Promise<Highlighter> | null = null;

const LANGS: BundledLanguage[] = [
  "bash",
  "shell",
  "json",
  "javascript",
  "typescript",
  "tsx",
];

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-dark-default"],
      langs: LANGS,
    });
  }
  return highlighterPromise;
}

export async function highlightCode(code: string, lang: string = "bash") {
  const hl = await getHighlighter();
  const supported = (LANGS as string[]).includes(lang) ? lang : "bash";
  return hl.codeToHtml(code, {
    lang: supported,
    theme: "github-dark-default",
  });
}
