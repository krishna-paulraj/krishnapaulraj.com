import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  BoxIcon,
  CheckCircle2Icon,
  DownloadIcon,
  FileTextIcon,
  FolderIcon,
  GitBranchIcon,
  RefreshCwIcon,
  TerminalIcon,
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";

import { Reveal } from "@/components/motion/reveal";
import CodeBlock from "@/components/terminal/code-block";
import Collapsible from "@/components/terminal/collapsible";
import { highlightCode } from "@/lib/highlight";

export const metadata: Metadata = {
  title: "Terminal Setup",
  description:
    "My terminal configuration — Zsh, Starship, Fastfetch, and the dotfiles I actually use day to day.",
};

const LINUX_INSTALL = `# Debian / Ubuntu
sudo apt update && sudo apt install -y \\
  zsh git curl build-essential

# Make Zsh your default shell
chsh -s $(which zsh)

# Install Homebrew on Linux
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`;

const HOMEBREW_PACKAGES = `brew install \\
  starship \\
  eza \\
  fzf \\
  zoxide \\
  fd \\
  fastfetch \\
  tree \\
  oven-sh/bun/bun \\
  node@22 \\
  nvm \\
  unzip \\
  unrar \\
  p7zip \\
  gzip \\
  bzip2 \\
  git \\
  net-tools`;

const ZSHRC_BACKUP = `[ -f ~/.zshrc ] && mv ~/.zshrc ~/.zshrc.backup`;
const ZSHRC_EDIT = `nano ~/.zshrc`;

const FASTFETCH_DIR = `mkdir -p ~/.config/fastfetch`;
const FASTFETCH_EDIT = `nano ~/.config/fastfetch/config.jsonc`;

const RELOAD = `source ~/.zshrc`;

const ZSHRC_CONTENT = `# History
HISTFILE=~/.zsh_history
HISTSIZE=10000
SAVEHIST=10000
setopt INC_APPEND_HISTORY SHARE_HISTORY HIST_IGNORE_DUPS

# PATH
export PATH="$HOME/.local/bin:$PATH"
export PATH="/opt/homebrew/bin:$PATH"

# Aliases
alias ls='eza --icons'
alias ll='eza -l --icons --git'
alias la='eza -la --icons --git'
alias cat='bat --paging=never'
alias g='git'
alias gst='git status'
alias gco='git checkout'
alias gp='git push'

# Tools
eval "$(starship init zsh)"
eval "$(zoxide init zsh)"
source <(fzf --zsh)

# Node version manager
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"

# Bun
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# Run fastfetch on shell start
fastfetch`;

const FASTFETCH_CONTENT = `{
  "$schema": "https://github.com/fastfetch-cli/fastfetch/raw/dev/doc/json_schema.json",
  "logo": {
    "type": "small",
    "padding": { "top": 1, "right": 2 }
  },
  "display": {
    "separator": " · "
  },
  "modules": [
    "title",
    "separator",
    "os",
    "host",
    "kernel",
    "uptime",
    "shell",
    "terminal",
    "cpu",
    "memory",
    "disk",
    "battery",
    "datetime"
  ]
}`;

function SectionHeader({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground [&_svg]:size-4">
        {icon}
      </div>
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
    </div>
  );
}

function Step({
  n,
  text,
  children,
}: {
  n: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 font-mono text-[11px] text-muted-foreground">
        {n}
      </div>
      <div className="flex-1 space-y-3">
        <p className="pt-0.5 text-sm text-foreground">{text}</p>
        {children}
      </div>
    </div>
  );
}

function PrereqItem({
  n,
  icon,
  title,
  desc,
}: {
  n: string;
  icon: ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 font-mono text-[11px] text-muted-foreground">
        {n}
      </div>
      <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground [&_svg]:size-3.5">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </li>
  );
}

export default async function TerminalPage() {
  const [
    linuxInstallHtml,
    homebrewHtml,
    zshrcBackupHtml,
    zshrcEditHtml,
    fastfetchDirHtml,
    fastfetchEditHtml,
    reloadHtml,
    zshrcContentHtml,
    fastfetchContentHtml,
  ] = await Promise.all([
    highlightCode(LINUX_INSTALL, "bash"),
    highlightCode(HOMEBREW_PACKAGES, "bash"),
    highlightCode(ZSHRC_BACKUP, "bash"),
    highlightCode(ZSHRC_EDIT, "bash"),
    highlightCode(FASTFETCH_DIR, "bash"),
    highlightCode(FASTFETCH_EDIT, "bash"),
    highlightCode(RELOAD, "bash"),
    highlightCode(ZSHRC_CONTENT, "bash"),
    highlightCode(FASTFETCH_CONTENT, "json"),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-6 font-sans">
      <Reveal>
        <h1 className="text-3xl font-bold tracking-tight">Terminal Setup</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Below is my terminal setup configuration.
        </p>
      </Reveal>

      <Reveal
        as="section"
        delay={0.1}
        className="mt-12 border-t border-border pt-8"
      >
        <SectionHeader icon={<BoxIcon />} title="Prerequisites" />
        <ol className="mt-6 space-y-4 pl-12">
          <PrereqItem
            n="1"
            icon={<TerminalIcon />}
            title="Zsh"
            desc="Modern shell (pre-installed on macOS, install on Linux)"
          />
          <PrereqItem
            n="2"
            icon={<FolderIcon />}
            title="Git"
            desc="Version control system"
          />
          <PrereqItem
            n="3"
            icon={<BoxIcon />}
            title="Homebrew"
            desc="Package manager for macOS/Linux (brew.sh)"
          />
        </ol>
      </Reveal>

      <Reveal
        as="section"
        delay={0.14}
        className="mt-12 border-t border-border pt-8"
      >
        <Collapsible icon={<TerminalIcon />} title="Linux Installation">
          <CodeBlock code={LINUX_INSTALL} html={linuxInstallHtml} />
        </Collapsible>
      </Reveal>

      <Reveal
        as="section"
        delay={0.18}
        className="mt-12 border-t border-border pt-8"
      >
        <SectionHeader
          icon={<DownloadIcon />}
          title="Install Required Packages"
        />
        <div className="mt-6 pl-12">
          <Step
            n="1.1"
            text="Run this one-liner to install all required packages:"
          >
            <CodeBlock code={HOMEBREW_PACKAGES} html={homebrewHtml} />
          </Step>
        </div>
      </Reveal>

      <Reveal
        as="section"
        delay={0.22}
        className="mt-12 border-t border-border pt-8"
      >
        <SectionHeader icon={<FileTextIcon />} title="Configure Zsh" />
        <div className="mt-6 space-y-6 pl-12">
          <Step n="2.1" text="Backup your existing .zshrc (if any):">
            <CodeBlock code={ZSHRC_BACKUP} html={zshrcBackupHtml} />
          </Step>
          <Step
            n="2.2"
            text="Create a new .zshrc file and paste the configuration below:"
          >
            <CodeBlock code={ZSHRC_EDIT} html={zshrcEditHtml} />
          </Step>
        </div>
      </Reveal>

      <Reveal
        as="section"
        delay={0.26}
        className="mt-12 border-t border-border pt-8"
      >
        <SectionHeader icon={<FileTextIcon />} title="Configure Fastfetch" />
        <div className="mt-6 space-y-6 pl-12">
          <Step n="3.1" text="Create the fastfetch config directory:">
            <CodeBlock code={FASTFETCH_DIR} html={fastfetchDirHtml} />
          </Step>
          <Step n="3.2" text="Create the config file:">
            <CodeBlock code={FASTFETCH_EDIT} html={fastfetchEditHtml} />
          </Step>
        </div>
      </Reveal>

      <Reveal
        as="section"
        delay={0.3}
        className="mt-12 border-t border-border pt-8"
      >
        <Collapsible icon={<FileTextIcon />} title=".zshrc Configuration">
          <CodeBlock code={ZSHRC_CONTENT} html={zshrcContentHtml} />
        </Collapsible>
      </Reveal>

      <Reveal
        as="section"
        delay={0.34}
        className="mt-12 border-t border-border pt-8"
      >
        <Collapsible icon={<FileTextIcon />} title="Fastfetch Configuration">
          <CodeBlock code={FASTFETCH_CONTENT} html={fastfetchContentHtml} />
        </Collapsible>
      </Reveal>

      <Reveal
        as="section"
        delay={0.38}
        className="mt-12 border-t border-border pt-8"
      >
        <SectionHeader icon={<RefreshCwIcon />} title="Apply Configuration" />
        <div className="mt-6 space-y-6 pl-12">
          <Step n="1" text="Reload your shell configuration:">
            <CodeBlock code={RELOAD} html={reloadHtml} />
          </Step>
          <div className="flex gap-3">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 font-mono text-[11px] text-muted-foreground">
              2
            </div>
            <p className="pt-0.5 text-sm text-foreground">
              Or simply restart your terminal
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.42} className="mt-10 pl-12">
        <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/40 px-4 py-3 text-sm">
          <CheckCircle2Icon className="size-4 text-emerald-500" />
          <span>Done! Your terminal is now configured.</span>
        </div>
      </Reveal>

      <Reveal
        as="section"
        delay={0.46}
        className="mt-12 border-t border-border pt-8"
      >
        <SectionHeader icon={<GitBranchIcon />} title="Source Repository" />
        <a
          href="https://github.com/krishnapaulraj/dotfiles"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 ml-12 flex items-start gap-3 rounded-lg border border-border bg-card/40 p-4 transition-colors hover:bg-muted/40"
        >
          <FaGithub className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              krishnapaulraj/dotfiles
            </p>
            <p className="text-xs text-muted-foreground">
              Full configuration files, documentation, and updates
            </p>
          </div>
        </a>
      </Reveal>
    </div>
  );
}
