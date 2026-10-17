import {
  isValidElement,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react';
import type { ExtraProps } from 'react-markdown';

// Fenced blocks with these languages are drawn as a terminal window.
const SHELL_LANGS = new Set([
  'bash', 'sh', 'shell', 'zsh', 'fish', 'console', 'terminal', 'shell-session', 'shellsession',
]);
// Languages that aren't worth showing as the card label.
const HIDDEN_LABELS = new Set(['text', 'txt', 'plain', 'plaintext', 'none']);

// Prompt shapes recognised inside terminal blocks:
//   ┌──(user㉿host)-[~/dir]     (Kali, line 1)
//   └─$ command                  (Kali, line 2)
//   user@host:~/dir$ command     (classic)
//   $ command                    (minimal)
const KALI_TOP = /^[┌╭]─+\(([^)]*?)[@\u327f]([^)]*?)\)-\[(.*?)\]\s*$/;
const KALI_BOTTOM = /^([└╰]─+[$#])\s?(.*)$/;
const CLASSIC = /^([\w.-]+@[\w.-]+:[^\s$#]*[$#])\s+(.*)$/;
const SIMPLE = /^(\$)\s+(.*)$/;

type Line =
  | { type: 'top'; text: string }
  | { type: 'cmd'; prompt: string; command: string }
  | { type: 'out'; text: string };

function parseLine(line: string): Line {
  if (KALI_TOP.test(line)) return { type: 'top', text: line };
  const m = line.match(KALI_BOTTOM) ?? line.match(CLASSIC) ?? line.match(SIMPLE);
  if (m) return { type: 'cmd', prompt: m[1], command: m[2] };
  return { type: 'out', text: line };
}

// Window title taken from the first prompt, e.g. "devilhunter@kali: ~/htb/devvortex"
function titleFromPrompt(lines: string[]): string | undefined {
  for (const line of lines) {
    const k = line.match(KALI_TOP);
    if (k) return `${k[1]}@${k[2]}: ${k[3]}`;
    const c = line.match(CLASSIC);
    if (c) return c[1].replace(/[$#]$/, '').replace(':', ': ');
  }
  return undefined;
}

function textOf(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children);
  return '';
}

// Long lines wrap instead of producing a horizontal scrollbar.
const WRAP = 'whitespace-pre-wrap [overflow-wrap:anywhere]';
const BODY = `m-0 px-5 py-4 font-mono text-sm leading-relaxed text-prose ${WRAP}`;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable (e.g. insecure context) -- nothing to do */
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-md border border-line px-3 py-1 font-mono text-xs text-ink-soft transition-colors hover:border-accent hover:text-ink"
    >
      {copied ? 'copied' : 'copy'}
    </button>
  );
}

function Command({ text }: { text: string }) {
  const m = text.match(/^(\s*)(sudo\s+)?(\S+)(.*)$/);
  if (!m) return <span className="text-ink">{text}</span>;
  const [, lead, sudo, bin, rest] = m;
  return (
    <>
      {lead}
      {sudo && <span className="text-[#8db1f2]">{sudo}</span>}
      <span className="text-[#8db1f2]">{bin}</span>
      <span className="text-ink">{rest}</span>
    </>
  );
}

function Terminal({
  title,
  lines,
  fallback,
}: {
  title: string;
  lines: Line[];
  fallback: ReactNode; // highlighted code, used when the block has no prompts
}) {
  const hasPrompt = lines.some((l) => l.type !== 'out');
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-line bg-surface">
      <div className="relative flex items-center border-b border-line bg-surface-hover px-4 py-3">
        <div className="flex gap-2" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-[#c4504f]" />
          <span className="h-3 w-3 rounded-full bg-[#c79a3c]" />
          <span className="h-3 w-3 rounded-full bg-[#4f8f58]" />
        </div>
        <span className="pointer-events-none absolute inset-x-20 truncate text-center font-mono text-sm text-ink-soft">
          {title}
        </span>
      </div>
      <pre className={BODY}>
        {hasPrompt ? (
          <code>
            {lines.map((l, i) => (
              <div key={i} className="min-h-[1lh]">
                {l.type === 'top' && <span className="text-accent">{l.text}</span>}
                {l.type === 'cmd' && (
                  <>
                    <span className="text-accent">{l.prompt}</span>{' '}
                    <Command text={l.command} />
                  </>
                )}
                {l.type === 'out' && l.text}
              </div>
            ))}
          </code>
        ) : (
          <code>{fallback}</code>
        )}
      </pre>
    </div>
  );
}

export default function CodeBlock({ node, children }: ComponentProps<'pre'> & ExtraProps) {
  const codeEl = isValidElement(children)
    ? (children as ReactElement<{ className?: string; children?: ReactNode }>)
    : null;

  // Not a fenced code block we understand: render a plain pre.
  if (!codeEl) {
    return <pre className={`my-6 rounded-xl border border-line bg-surface ${BODY}`}>{children}</pre>;
  }

  const lang = codeEl.props.className?.match(/language-(\S+)/)?.[1]?.toLowerCase();
  const highlighted = codeEl.props.children;
  const raw = textOf(highlighted).replace(/\n$/, '');

  // Optional custom title from the fence: ```bash title="user@host: ~/dir"
  const codeNode = node?.children.find((c) => c.type === 'element' && c.tagName === 'code');
  const meta = (codeNode as { data?: { meta?: string } } | undefined)?.data?.meta;
  const metaTitle = meta?.match(/title=(?:"([^"]*)"|'([^']*)'|(\S+))/)?.slice(1).find(Boolean);

  if (lang && SHELL_LANGS.has(lang)) {
    const lines = raw.split('\n').map(parseLine);
    const title = metaTitle ?? titleFromPrompt(raw.split('\n')) ?? lang;
    return <Terminal title={title} lines={lines} fallback={highlighted} />;
  }

  const label = metaTitle ?? (lang && !HIDDEN_LABELS.has(lang) ? lang : 'code');
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="font-mono text-sm text-ink-soft">{label}</span>
        <CopyButton text={raw} />
      </div>
      <pre className={BODY}>
        <code>{highlighted}</code>
      </pre>
    </div>
  );
}
