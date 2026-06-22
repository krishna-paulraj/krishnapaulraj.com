import type { Metadata } from "next";

import { highlightCode } from "@/lib/highlight";
import { ComponentShowcase } from "@/components/sections/components-page/component-showcase";
import type { ApiEntry } from "@/components/sections/components-page/api-reference";
import { TechStackDemo } from "@/components/sections/components-page/demos/tech-stack-demo";
import registry from "@/public/r/tech-stack.json";

export const metadata: Metadata = {
  title: registry.title,
  description: registry.description,
  alternates: { canonical: "/components/tech-stack" },
  robots: { index: false, follow: true },
};

const USAGE = `import TechStack from "@/components/tech-stack";
import { SiReact, SiNextdotjs, SiTypescript } from "react-icons/si";

<TechStack
  items={[
    { icon: SiReact, label: "React", color: "#61DAFB" },
    { icon: SiNextdotjs, label: "Next.js" },
    { icon: SiTypescript, label: "TypeScript", color: "#3178C6" },
  ]}
/>
`;

const API: ApiEntry[] = [
  {
    name: "TechStack",
    props: [
      {
        name: "items",
        type: "TechItem[]",
        description:
          "Array of tech items to display. Each renders as an overlapping pill that expands on hover.",
        required: true,
      },
    ],
  },
  {
    name: "TechItem",
    description: "Shape of each item passed to the items array.",
    props: [
      {
        name: "icon",
        type: "React.ElementType",
        description: "Icon component to render inside the pill.",
        required: true,
      },
      {
        name: "label",
        type: "string",
        description: "Text revealed when the pill is hovered.",
        required: true,
      },
      {
        name: "color",
        type: "string",
        description: "CSS color applied to the icon. Defaults to currentColor.",
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
      demo={<TechStackDemo />}
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
