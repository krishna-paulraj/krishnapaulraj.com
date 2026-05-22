import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSlug)
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

export async function renderMarkdown(content: string): Promise<string> {
  return String(await processor.process(content));
}

export function countWords(markdown: string): number {
  const stripped = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_~\-=]/g, " ");
  return stripped.split(/\s+/).filter(Boolean).length;
}
