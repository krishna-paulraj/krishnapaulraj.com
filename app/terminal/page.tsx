import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  BoxIcon,
  CheckCircle2Icon,
  DownloadIcon,
  FileTextIcon,
  GitBranchIcon,
  MonitorIcon,
  RefreshCwIcon,
  SquareTerminalIcon,
  TerminalIcon,
  TypeIcon,
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";

import { Reveal } from "@/components/motion/reveal";
import CodeBlock from "@/components/terminal/code-block";
import Collapsible from "@/components/terminal/collapsible";
import { highlightCode } from "@/lib/highlight";

export const metadata: Metadata = {
  title: "Terminal Setup",
  description:
    "My macOS terminal setup — Zsh with Powerlevel10k, a tmux workflow, Neovim, and the CLI tools (eza, bat, fzf, zoxide) I use every day.",
  alternates: { canonical: "/terminal" },
};

const BREW_FORMULAE = `brew install \\
  powerlevel10k \\
  zsh-autosuggestions \\
  zsh-syntax-highlighting \\
  neovim \\
  tmux \\
  eza \\
  bat \\
  fd \\
  fzf \\
  ripgrep \\
  zoxide \\
  lazygit \\
  gh \\
  thefuck \\
  tldr \\
  tree`;

const BREW_CASKS = `brew install --cask \\
  iterm2 \\
  font-hack-nerd-font`;

const ZSHRC_BACKUP = `[ -f ~/.zshrc ] && mv ~/.zshrc ~/.zshrc.backup`;
const ZSHRC_EDIT = `nvim ~/.zshrc`;
const P10K_CONFIGURE = `p10k configure`;

const TMUX_DIR = `mkdir -p ~/.config/tmux`;
const TMUX_EDIT = `nvim ~/.config/tmux/tmux.conf`;

const RELOAD = `source ~/.zshrc`;

const ZSHRC_CONTENT = `# ===== Powerlevel10k =====
# Enable instant prompt — keep this near the top of ~/.zshrc
if [[ -r "\${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-\${(%):-%n}.zsh" ]]; then
  source "\${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-\${(%):-%n}.zsh"
fi

source /opt/homebrew/share/powerlevel10k/powerlevel10k.zsh-theme
[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh

# ===== Aliases =====
alias reload-zsh="source ~/.zshrc"
alias edit-zsh="nvim ~/.zshrc"
alias ls="eza --icons=always"
alias ll="eza -l --color=always --icons=always"
alias cd="z"   # zoxide

# ===== History =====
HISTFILE=$HOME/.zhistory
HISTSIZE=999
SAVEHIST=1000
setopt share_history
setopt hist_expire_dups_first
setopt hist_ignore_dups
setopt hist_verify

# ===== Keybindings =====
bindkey '^[[A' history-search-backward
bindkey '^[[B' history-search-forward
bindkey '^ ' end-of-line

# ===== Plugins =====
source $(brew --prefix)/share/zsh-autosuggestions/zsh-autosuggestions.zsh
source $(brew --prefix)/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

# ===== fzf =====
eval "$(fzf --zsh)"

# TokyoNight theme
fg="#CBE0F0"; bg="#011628"; bg_highlight="#143652"
purple="#B388FF"; blue="#06BCE4"; cyan="#2CF9ED"
export FZF_DEFAULT_OPTS="--color=fg:\${fg},bg:\${bg},hl:\${purple},fg+:\${fg},bg+:\${bg_highlight},hl+:\${purple},info:\${blue},prompt:\${cyan},pointer:\${cyan},marker:\${cyan},spinner:\${cyan},header:\${cyan}"

# Use fd instead of find
export FZF_DEFAULT_COMMAND="fd --hidden --strip-cwd-prefix --exclude .git"
export FZF_CTRL_T_COMMAND="$FZF_DEFAULT_COMMAND"
export FZF_ALT_C_COMMAND="fd --type=d --hidden --strip-cwd-prefix --exclude .git"

_fzf_compgen_path() { fd --hidden --exclude .git . "$1"; }
_fzf_compgen_dir()  { fd --type=d --hidden --exclude .git . "$1"; }

# Previews — eza for directories, bat for files
show_file_or_dir_preview="if [ -d {} ]; then eza --tree --color=always {} | head -200; else bat -n --color=always --line-range :500 {}; fi"
export FZF_CTRL_T_OPTS="--preview '$show_file_or_dir_preview'"
export FZF_ALT_C_OPTS="--preview 'eza --tree --color=always {} | head -200'"

_fzf_comprun() {
  local command=$1
  shift
  case "$command" in
    cd)           fzf --preview 'eza --tree --color=always {} | head -200' "$@" ;;
    export|unset) fzf --preview "eval 'echo \\\${}'"        "$@" ;;
    ssh)          fzf --preview 'dig {}'                   "$@" ;;
    *)            fzf --preview "$show_file_or_dir_preview" "$@" ;;
  esac
}

# ===== Tools =====
export BAT_THEME=tokyonight_night
eval "$(thefuck --alias)"
eval "$(thefuck --alias fk)"

# ===== Languages & runtimes =====
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \\. "$NVM_DIR/bash_completion"
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"

export JAVA_HOME=$(/usr/libexec/java_home)
export PATH="$JAVA_HOME/bin:$PATH"

export PATH="$HOME/.cargo/bin:$PATH"

# ===== Keep zoxide init last =====
eval "$(zoxide init zsh)"

. "$HOME/.local/bin/env"`;

const TMUX_CONTENT = `# ===== General =====
set -g default-terminal "xterm-256color"
set -ga terminal-overrides ",xterm-256color:Tc"
set-option -g focus-events on
set-option -g repeat-time 0
set -sg escape-time 10
set-option -g history-limit 64096
set-window-option -g mode-keys vi

# Prefix: Ctrl-t instead of Ctrl-b
unbind C-b
set-option -g prefix C-t

# ===== Key bindings =====
# Reload config
bind r source-file ~/.config/tmux/tmux.conf \\; display "Reloaded!"
# Open the current pane's directory in Finder
bind o run-shell "open '#{pane_current_path}'"
# Kill every pane except the current one
bind -r e kill-pane -a

# vim-style pane navigation
bind -r k select-pane -U
bind -r j select-pane -D
bind -r h select-pane -L
bind -r l select-pane -R

# Resize panes
bind -r C-k resize-pane -U 5
bind -r C-j resize-pane -D 5
bind -r C-h resize-pane -L 5
bind -r C-l resize-pane -R 5

# Move windows
bind-key -n C-S-Left  swap-window -t -1 \\; previous-window
bind-key -n C-S-Right swap-window -t +1 \\; next-window

# prefix + g → pop open lazygit in the current directory
bind -r g display-popup -d '#{pane_current_path}' -w80% -h80% -E lazygit

# Adapt the title bar to the connected host
set -g set-titles on
set -g set-titles-string "#T"

# ===== Modules (full versions live in the dotfiles repo) =====
if-shell "uname -s | grep -q Darwin" "source ~/.config/tmux/macos.conf"
source ~/.config/tmux/statusline.conf`;

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
      <div className="min-w-0 flex-1 space-y-3">
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
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </li>
  );
}

export default async function TerminalPage() {
  const [
    brewFormulaeHtml,
    brewCasksHtml,
    zshrcBackupHtml,
    zshrcEditHtml,
    p10kConfigureHtml,
    tmuxDirHtml,
    tmuxEditHtml,
    reloadHtml,
    zshrcContentHtml,
    tmuxContentHtml,
  ] = await Promise.all([
    highlightCode(BREW_FORMULAE, "bash"),
    highlightCode(BREW_CASKS, "bash"),
    highlightCode(ZSHRC_BACKUP, "bash"),
    highlightCode(ZSHRC_EDIT, "bash"),
    highlightCode(P10K_CONFIGURE, "bash"),
    highlightCode(TMUX_DIR, "bash"),
    highlightCode(TMUX_EDIT, "bash"),
    highlightCode(RELOAD, "bash"),
    highlightCode(ZSHRC_CONTENT, "bash"),
    highlightCode(TMUX_CONTENT, "bash"),
  ]);

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-3 md:px-6 py-6 font-sans">
      <Reveal>
        <h1 className="text-3xl font-bold tracking-tight">Terminal Setup</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The setup I actually use on macOS — iTerm2 running Zsh with
          Powerlevel10k, a tmux workflow, Neovim, and a handful of modern CLI
          tools. Everything below mirrors my dotfiles.
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
            icon={<BoxIcon />}
            title="Homebrew"
            desc="Package manager for macOS — installs everything below (brew.sh)"
          />
          <PrereqItem
            n="2"
            icon={<MonitorIcon />}
            title="iTerm2"
            desc="Terminal emulator (brew install --cask iterm2)"
          />
          <PrereqItem
            n="3"
            icon={<TypeIcon />}
            title="Hack Nerd Font"
            desc="Patched font so icons and glyphs render in the prompt"
          />
          <PrereqItem
            n="4"
            icon={<TerminalIcon />}
            title="Zsh"
            desc="Modern shell — pre-installed on macOS"
          />
          <PrereqItem
            n="5"
            icon={<GitBranchIcon />}
            title="Git"
            desc="Version control system"
          />
        </ol>
      </Reveal>

      <Reveal
        as="section"
        delay={0.16}
        className="mt-12 border-t border-border pt-8"
      >
        <SectionHeader
          icon={<DownloadIcon />}
          title="Install Required Packages"
        />
        <div className="mt-6 space-y-6 pl-12">
          <Step n="1.1" text="Install the CLI tools, prompt, and shell plugins:">
            <CodeBlock code={BREW_FORMULAE} html={brewFormulaeHtml} />
          </Step>
          <Step n="1.2" text="Install iTerm2 and the Nerd Font:">
            <CodeBlock code={BREW_CASKS} html={brewCasksHtml} />
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
          <Step n="2.1" text="Back up your existing .zshrc (if any):">
            <CodeBlock code={ZSHRC_BACKUP} html={zshrcBackupHtml} />
          </Step>
          <Step
            n="2.2"
            text="Create a new .zshrc and paste the configuration below:"
          >
            <CodeBlock code={ZSHRC_EDIT} html={zshrcEditHtml} />
          </Step>
          <Step
            n="2.3"
            text="Style the Powerlevel10k prompt with the interactive configurator (optional):"
          >
            <CodeBlock code={P10K_CONFIGURE} html={p10kConfigureHtml} />
          </Step>
        </div>
      </Reveal>

      <Reveal
        as="section"
        delay={0.26}
        className="mt-12 border-t border-border pt-8"
      >
        <SectionHeader icon={<SquareTerminalIcon />} title="Configure tmux" />
        <div className="mt-6 space-y-6 pl-12">
          <Step n="3.1" text="Create the tmux config directory:">
            <CodeBlock code={TMUX_DIR} html={tmuxDirHtml} />
          </Step>
          <Step n="3.2" text="Create the config file:">
            <CodeBlock code={TMUX_EDIT} html={tmuxEditHtml} />
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
        <Collapsible icon={<SquareTerminalIcon />} title="tmux Configuration">
          <CodeBlock code={TMUX_CONTENT} html={tmuxContentHtml} />
        </Collapsible>
      </Reveal>

      <Reveal
        as="section"
        delay={0.38}
        className="mt-12 border-t border-border pt-8"
      >
        <SectionHeader icon={<RefreshCwIcon />} title="Apply Configuration" />
        <div className="mt-6 space-y-6 pl-12">
          <Step n="1" text="Reload your shell (or use the reload-zsh alias):">
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
          href="https://github.com/krishna-paulraj/dotfiles"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 ml-12 flex items-start gap-3 rounded-lg border border-border bg-card/40 p-4 transition-colors hover:bg-muted/40"
        >
          <FaGithub className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              krishna-paulraj/dotfiles
            </p>
            <p className="text-xs text-muted-foreground">
              Full configuration files, the tmux modules, and updates
            </p>
          </div>
        </a>
      </Reveal>
    </div>
  );
}
