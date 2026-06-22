import { HighlightedHeadingDemo } from "./demos/highlighted-heading-demo";
import { TechStackDemo } from "./demos/tech-stack-demo";

export const COMPONENTS = [
  {
    slug: "highlighted-heading",
    title: "Highlighted Heading",
    description: "A subtitle pill with subtle pulsing corner dots.",
    preview: <HighlightedHeadingDemo />,
  },
  {
    slug: "tech-stack",
    title: "Tech Stack",
    description:
      "A hover-expandable stack of overlapping framer-motion pills for tech badges.",
    preview: <TechStackDemo />,
  },
];
