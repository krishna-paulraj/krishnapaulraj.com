/**
 * Journey milestones for /timeline, ordered oldest → newest. The one entry
 * with `current: true` renders as the in-progress step; everything before it
 * shows as completed on the rail.
 */

export type TimelineMilestone = {
  id: string;
  /** Display label: "Jun 2025", "2021", "Now". */
  date: string;
  /** Machine-readable date for the <time> element, when one exists. */
  dateTime?: string;
  title: string;
  description: string;
  /** The ongoing chapter — exactly one entry should set this. */
  current?: boolean;
};

export const MILESTONES: TimelineMilestone[] = [
  {
    id: "started-coding",
    date: "2019",
    dateTime: "2019",
    title: "Wrote my first line of code",
    description:
      "Where it all started — tinkering, breaking things, and slowly falling for the web.",
  },
  // TODO(krish): add degree/institution if you want more detail here.
  {
    id: "education",
    date: "2021 – 2025",
    title: "Studied engineering",
    description:
      "Formal foundations, plus all the late-night side projects that taught the practical half.",
  },
  {
    id: "blocsys-intern",
    date: "Jun 2025",
    dateTime: "2025-06",
    title: "Software Developer Intern at Blocsys",
    description:
      "First industry role — shipping React and Next.js features on production apps.",
  },
  // TODO(krish): confirm the month the full-time role started.
  {
    id: "blocsys-developer",
    date: "Jul 2025",
    dateTime: "2025-07",
    title: "Jr. Blockchain Developer at Blocsys",
    description:
      "Full-time: scalable web apps with TypeScript and Next.js, Web3 integrations across Solana and EVM chains, and LangChain-powered AI tooling.",
  },
  // TODO(krish): exact launch dates for the site and projects.
  {
    id: "site-launch",
    date: "2026",
    dateTime: "2026",
    title: "Launched krishnapaulraj.com",
    description:
      "This site — writing, projects like Writora and P2P Messenger, live analytics, and a public kanban board.",
  },
  {
    id: "now",
    date: "Now",
    title: "Building, writing, learning",
    description:
      "Deepening my work at Blocsys, exploring AI tooling, and sharing what I learn along the way.",
    current: true,
  },
];
