import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import type { ReactNode } from "react";

import CodeBlock from "@/components/terminal/code-block";
import { Reveal } from "@/components/motion/reveal";
import { highlightCode } from "@/lib/highlight";

import { InstallCommand } from "./install-command";
import { PreviewTabs } from "./preview-tabs";
import { ApiReference, type ApiEntry } from "./api-reference";
import { CN_HELPER_CODE } from "./cn-helper";

export async function ComponentShowcase({
  title,
  description,
  registryName,
  demo,
  sourceCode,
  sourceHtml,
  usageCode,
  usageHtml,
  apiReference,
  dependencies,
  filePath,
}: {
  title: string;
  description: string;
  registryName: string;
  demo: ReactNode;
  sourceCode: string;
  sourceHtml: string;
  usageCode?: string;
  usageHtml?: string;
  apiReference?: ApiEntry[];
  dependencies?: string[];
  filePath?: string;
}) {
  const usesCn = /from\s+["']@\/lib\/utils["']/.test(sourceCode);
  const cnHelperHtml = usesCn
    ? await highlightCode(CN_HELPER_CODE, "typescript")
    : undefined;

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-6 font-sans">
      <Reveal>
        <Link
          href="/components"
          className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          Components
        </Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </Reveal>

      <Reveal as="section" delay={0.2} className="mt-10">
        <PreviewTabs
          preview={
            <div className="flex min-h-56 items-center justify-center rounded-lg border border-border bg-muted/30 p-8 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-position:0_0] [background-size:14px_14px]">
              {demo}
            </div>
          }
          code={<CodeBlock code={sourceCode} html={sourceHtml} />}
        />
      </Reveal>

      <Reveal as="section" delay={0.1} className="mt-12 space-y-4">
        <SectionHeading>Installation</SectionHeading>
        <InstallCommand
          registryName={registryName}
          dependencies={dependencies}
          filePath={filePath}
          sourceCode={sourceCode}
          sourceHtml={sourceHtml}
          usesCn={usesCn}
          cnHelperCode={CN_HELPER_CODE}
          cnHelperHtml={cnHelperHtml}
        />
      </Reveal>

      {usageCode && usageHtml && (
        <Reveal as="section" delay={0.15} className="mt-12 space-y-4">
          <SectionHeading>Usage</SectionHeading>
          <CodeBlock code={usageCode} html={usageHtml} />
        </Reveal>
      )}

      {apiReference && apiReference.length > 0 && (
        <Reveal as="section" delay={0.2} className="mt-12 space-y-6">
          <SectionHeading>API Reference</SectionHeading>
          <ApiReference entries={apiReference} />
        </Reveal>
      )}
    </div>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="border-b border-border pb-2 text-lg font-semibold tracking-tight text-foreground">
      {children}
    </h2>
  );
}
