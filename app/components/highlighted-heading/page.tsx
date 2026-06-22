import type { Metadata } from "next";

import { highlightCode } from "@/lib/highlight";
import { ComponentShowcase } from "@/components/sections/components-page/component-showcase";
import type { ApiEntry } from "@/components/sections/components-page/api-reference";
import { HighlightedHeadingDemo } from "@/components/sections/components-page/demos/highlighted-heading-demo";
import registry from "@/public/r/highlighted-heading.json";

export const metadata: Metadata = {
  title: registry.title,
  description: registry.description,
  alternates: { canonical: "/components/highlighted-heading" },
  robots: { index: false, follow: true },
};

const USAGE = `import HighlightedHeading from "@/components/highlighted-heading";

<HighlightedHeading className="my-4">
  A subtitle worth highlighting
</HighlightedHeading>
`;

const API: ApiEntry[] = [
  {
    name: "HighlightedHeading",
    props: [
      {
        name: "children",
        type: "React.ReactNode",
        description: "Content rendered inside the heading.",
        required: true,
      },
      {
        name: "className",
        type: "string",
        description:
          "Additional Tailwind classes merged onto the root element.",
      },
    ],
  },
];

export default async function Page() {
  const source = registry.files[0].content;
  const [html, usageHtml] = await Promise.all([
    highlightCode(source, "tsx"),
    highlightCode(USAGE, "tsx"),
  ]);

  return (
    <ComponentShowcase
      title={registry.title}
      description={registry.description}
      registryName={registry.name}
      demo={<HighlightedHeadingDemo />}
      sourceCode={source}
      sourceHtml={html}
      usageCode={USAGE}
      usageHtml={usageHtml}
      apiReference={API}
      dependencies={registry.dependencies}
      filePath={registry.files[0].path}
    />
  );
}
