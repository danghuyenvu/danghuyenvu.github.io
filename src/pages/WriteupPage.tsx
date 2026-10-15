import { useMemo, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';
import { getWriteupBySlug } from '../lib/writeups';

// Resolve a markdown image path against the site's base URL.
function resolveImageSrc(src?: string): string {
  if (!src) return '';
  if (/^https?:\/\//.test(src)) return src;
  const base = import.meta.env.BASE_URL;
  return base.replace(/\/$/, '') + '/' + src.replace(/^\//, '');
}

// Short badge text for well-known platforms; anything else shows as written.
const PLATFORM_ABBR: Record<string, string> = {
  hackthebox: 'HTB',
  'hack the box': 'HTB',
  tryhackme: 'THM',
  'try hack me': 'THM',
};

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: 'text-[#86c98f]',
  medium: 'text-[#e3b25a]',
  hard: 'text-[#e8855b]',
  insane: 'text-[#b690ea]',
};

function formatDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

// HTB serves a public share-card image for every owned machine:
//   page:  https://labs.hackthebox.com/achievement/machine/<userId>/<machineId>
//   image: https://labs.hackthebox.com/achievement/machine/preview/<userId>/<machineId>.png
// Accepts the page URL, or just "<userId>/<machineId>".
function parseAchievement(value?: string) {
  if (!value) return null;
  const m =
    value.match(/achievement\/machine\/(?:preview\/)?(\d+)\/(\d+)/) ??
    value.match(/^\s*(\d+)\D+(\d+)\s*$/);
  if (!m) return null;
  const [, user, machine] = m;
  return {
    page: `https://labs.hackthebox.com/achievement/machine/${user}/${machine}`,
    image: `https://labs.hackthebox.com/achievement/machine/preview/${user}/${machine}.png`,
  };
}

function AchievementCard({ value, name }: { value?: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const a = parseAchievement(value);
  if (!a || failed) return null; // hide quietly if HTB's image can't be loaded
  return (
    <figure className="mb-10">
      <a
        href={a.page}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-block overflow-hidden rounded-xl border border-line transition-colors hover:border-accent"
      >
        <img
          src={a.image}
          alt={`${name} pwned on Hack The Box`}
          width={700}
          height={360}
          loading="lazy"
          onError={() => setFailed(true)}
          className="block h-auto w-full max-w-[700px]"
        />
      </a>
      <figcaption className="mt-2 font-mono text-xs text-ink-soft">Proof of pwn · Hack The Box ↗</figcaption>
    </figure>
  );
}

function Badge({ children, className }: { children: ReactNode; className: string }) {
  return (
    <span className={`rounded-md border px-3 py-1 font-mono text-sm ${className}`}>{children}</span>
  );
}

// The TL;DR callout is styled per-element (not via .prose-lab) so it can have its own look.
const tldrComponents: Components = {
  p: ({ children }) => (
    <p className="mb-3 text-lg leading-relaxed text-prose last:mb-0">{children}</p>
  ),
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  code: ({ children }) => (
    <code className="rounded border border-line bg-paper px-1.5 py-0.5 font-mono text-[0.85em] text-accent-text">
      {children}
    </code>
  ),
  a: ({ href, children }) => (
    <a href={href} className="text-accent underline underline-offset-2 hover:text-accent-text">
      {children}
    </a>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 list-decimal space-y-1.5 pl-6 text-lg text-prose marker:text-accent last:mb-0">
      {children}
    </ol>
  ),
  ul: ({ children }) => (
    <ul className="mb-3 list-disc space-y-1.5 pl-6 text-lg text-prose marker:text-accent last:mb-0">
      {children}
    </ul>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
};

export default function WriteupPage() {
  const { slug } = useParams<{ slug: string }>();
  const writeup = useMemo(() => (slug ? getWriteupBySlug(slug) : undefined), [slug]);

  if (!writeup) {
    return (
      <div>
        <p className="mb-4 font-mono text-sm text-ink-soft">Writeup not found.</p>
        <Link to="/" className="text-sm text-accent underline">
          Back to all writeups
        </Link>
      </div>
    );
  }

  const w = writeup;
  const diffColor = DIFFICULTY_COLOR[w.difficulty?.toLowerCase() ?? ''] ?? 'text-ink';
  const platformBadge = w.platform
    ? (PLATFORM_ABBR[w.platform.toLowerCase()] ?? w.platform)
    : undefined;
  const hasCategories = !(w.categories.length === 1 && w.categories[0] === 'Uncategorized');

  // Info table rows -- a row only appears if its field is set in the frontmatter.
  const rows: { label: string; value: ReactNode }[] = [];
  if (w.platform) rows.push({ label: 'Platform', value: w.platform });
  if (w.machineUrl) {
    rows.push({
      label: 'Machine',
      value: (
        <a
          href={w.machineUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="text-accent underline-offset-2 hover:text-accent-text hover:underline"
        >
          {w.machine ?? 'View machine'} ↗
        </a>
      ),
    });
  } else if (w.machine) {
    rows.push({ label: 'Machine', value: w.machine });
  }
  if (w.difficulty) rows.push({ label: 'Difficulty', value: <span className={diffColor}>{w.difficulty}</span> });
  if (w.os) rows.push({ label: 'OS', value: w.os });
  if (w.creator) rows.push({ label: 'Creator', value: w.creator });
  if (w.date) rows.push({ label: 'Date', value: formatDate(w.date) });
  if (hasCategories) rows.push({ label: 'Category', value: w.categories.join(' · ') });
  if (w.tags.length) {
    rows.push({
      label: 'Tags',
      value: (
        <span className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-sm text-ink-soft">
          {w.tags.map((t) => (
            <span key={t}>#{t}</span>
          ))}
        </span>
      ),
    });
  }

  // Put the label inline ("TL;DR — ...") unless the text contains a list, or starts with a heading/quote/code.
  const tldrMarkdown = w.tldr
    ? /^\s*(#|>|```)|^\s*([-*+]|\d+[.)])\s/m.test(w.tldr)
      ? `**Summary**\n\n${w.tldr}`
      : `**Summary** — ${w.tldr}`
    : undefined;

  return (
    <article>
      <nav aria-label="Breadcrumb" className="font-mono text-sm text-ink-soft">
        <Link to="/" className="text-ink transition-colors hover:text-accent">
          writeups
        </Link>
        <span className="mx-2">/</span>
        <span>{w.slug}</span>
      </nav>

      <header className="mt-8">
        {(platformBadge || w.difficulty || w.os) && (
          <div className="mb-5 flex flex-wrap gap-2">
            {platformBadge && (
              <Badge className="border-accent bg-accent-soft text-accent">{platformBadge}</Badge>
            )}
            {w.difficulty && (
              <Badge className={`border-line bg-surface ${diffColor}`}>{w.difficulty}</Badge>
            )}
            {w.os && <Badge className="border-line bg-surface text-ink">{w.os}</Badge>}
          </div>
        )}

        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          {w.title}
        </h1>

        <p className="mt-5 font-mono text-sm text-ink-soft">
          {w.date && <>{formatDate(w.date)} </>}
        </p>
      </header>

      <div className="my-8 border-t border-line" />

      {rows.length > 0 && (
        <dl className="mb-8 overflow-hidden rounded-xl border border-line bg-surface">
          {rows.map((r) => (
            <div
              key={r.label}
              className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-line px-5 py-3.5 last:border-b-0 sm:grid-cols-[9rem_1fr]"
            >
              <dt className="pt-1 font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                {r.label}
              </dt>
              <dd className="min-w-0 break-words text-ink">{r.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {tldrMarkdown && (
        <aside className="mb-10 rounded-r-xl border-l-4 border-accent bg-surface px-7 py-6">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={tldrComponents}
          >
            {tldrMarkdown}
          </ReactMarkdown>
        </aside>
      )}

      <AchievementCard value={w.achievement} name={w.machine ?? w.title} />

      <div className="prose-lab">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            img: ({ src, alt }) => (
              // eslint-disable-next-line jsx-a11y/alt-text
              <img src={resolveImageSrc(src as string)} alt={alt ?? ''} loading="lazy" />
            ),
          }}
        >
          {w.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}