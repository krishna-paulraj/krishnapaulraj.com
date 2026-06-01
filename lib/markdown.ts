import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

export type TocItem = {
  title: string;
  /** Anchor href, e.g. "#getting-started" */
  url: string;
  /** Heading level: 2 for h2, 3 for h3 */
  depth: number;
};

type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: { id?: string } & Record<string, unknown>;
  children?: HastNode[];
};

function hastText(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  if (!node.children) return "";
  return node.children.map(hastText).join("");
}

/**
 * Collects h2/h3 headings (with ids assigned by rehype-slug) into `toc`.
 * Must run after rehype-slug and before rehype-autolink-headings so the
 * collected title text does not include the appended "#" anchor.
 */
function rehypeCollectToc(toc: TocItem[]) {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (
        node.type === "element" &&
        (node.tagName === "h2" || node.tagName === "h3") &&
        node.properties?.id
      ) {
        toc.push({
          title: hastText(node).trim(),
          url: `#${node.properties.id}`,
          depth: node.tagName === "h2" ? 2 : 3,
        });
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

function createProcessor(toc?: TocItem[]) {
  let processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug);

  if (toc) {
    processor = processor.use(() => rehypeCollectToc(toc));
  }

  return processor
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      properties: {
        className: ["heading-anchor"],
        ariaLabel: "Link to section",
      },
      content: {
        type: "element",
        tagName: "span",
        properties: { className: ["heading-anchor-icon"], ariaHidden: "true" },
        children: [{ type: "text", value: "#" }],
      },
    })
    .use(rehypePrettyCode, {
      theme: "github-dark-default",
      keepBackground: false,
      defaultLang: "plaintext",
    })
    .use(rehypeStringify, { allowDangerousHtml: true });
}

const processor = createProcessor();

export async function renderMarkdown(content: string): Promise<string> {
  return String(await processor.process(content));
}

export async function renderMarkdownWithToc(
  content: string,
): Promise<{ html: string; toc: TocItem[] }> {
  const toc: TocItem[] = [];
  const html = String(await createProcessor(toc).process(content));
  return { html, toc };
}

export function countWords(markdown: string): number {
  const stripped = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_~\-=]/g, " ");
  return stripped.split(/\s+/).filter(Boolean).length;
}
