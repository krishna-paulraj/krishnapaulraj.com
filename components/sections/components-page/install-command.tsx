"use client";

import type { ReactNode } from "react";

import {
  CodeBlockCommand,
  convertNpmCommand,
} from "@/components/ui/code-block-command";
import CodeBlock from "@/components/terminal/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function InstallCommand({
  registryName,
  dependencies,
  filePath,
  sourceCode,
  sourceHtml,
  usesCn,
  cnHelperCode,
  cnHelperHtml,
}: {
  registryName: string;
  dependencies?: string[];
  filePath?: string;
  sourceCode?: string;
  sourceHtml?: string;
  usesCn?: boolean;
  cnHelperCode?: string;
  cnHelperHtml?: string;
}) {
  const commandCommands = convertNpmCommand(
    `npx shadcn@latest add https://krishnapaulraj.com/r/${registryName}.json`,
  );

  const allDeps = [
    ...(dependencies ?? []),
    ...(usesCn ? ["clsx", "tailwind-merge"] : []),
  ];
  const depsCommands =
    allDeps.length > 0
      ? convertNpmCommand(`npm install ${allDeps.join(" ")}`)
      : null;

  const hasManual = !!(sourceCode && sourceHtml && filePath);

  const commandPane = (
    <CodeBlockCommand
      prompt={`Install the ${registryName} component from krishnapaulraj.com using the shadcn CLI.`}
      {...commandCommands}
    />
  );

  if (!hasManual) {
    return commandPane;
  }

  const steps: { title: string; content: ReactNode }[] = [];
  if (depsCommands) {
    steps.push({
      title: "Install the following dependencies",
      content: <CodeBlockCommand {...depsCommands} />,
    });
  }
  if (usesCn && cnHelperCode && cnHelperHtml) {
    steps.push({
      title: "Add a cn helper",
      content: (
        <FilePathCodeBlock
          path="lib/utils.ts"
          code={cnHelperCode}
          html={cnHelperHtml}
        />
      ),
    });
  }
  steps.push({
    title: "Copy and paste the following code into your project",
    content: (
      <FilePathCodeBlock
        path={filePath!}
        code={sourceCode!}
        html={sourceHtml!}
      />
    ),
  });

  return (
    <Tabs defaultValue="command">
      <TabsList>
        <TabsTrigger value="command">Command</TabsTrigger>
        <TabsTrigger value="manual">Manual</TabsTrigger>
      </TabsList>
      <TabsContent value="command">{commandPane}</TabsContent>
      <TabsContent value="manual">
        <ol className="space-y-6">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <div className="border-border text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-foreground pt-0.5 text-sm font-semibold tracking-tight">
                  {step.title}
                </h3>
                <div className="mt-3">{step.content}</div>
              </div>
            </li>
          ))}
        </ol>
      </TabsContent>
    </Tabs>
  );
}

function FilePathCodeBlock({
  path,
  code,
  html,
}: {
  path: string;
  code: string;
  html: string;
}) {
  return (
    <div>
      <div className="border-border bg-muted text-muted-foreground rounded-t-lg border border-b-0 px-3 py-2 font-mono text-xs">
        {path}
      </div>
      <div className="[&>*]:rounded-t-none">
        <CodeBlock code={code} html={html} />
      </div>
    </div>
  );
}
