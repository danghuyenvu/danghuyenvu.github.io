import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

const components: Components = {
  p: ({ children }) => (
    <p className="mb-3 text-lg leading-relaxed text-prose last:mb-0">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-ink">{children}</strong>
  ),
  code: ({ children }) => (
    <code className="rounded border border-line bg-paper px-1.5 py-0.5 font-mono text-[0.85em] text-accent-text">
      {children}
    </code>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-accent underline underline-offset-2 hover:text-accent-text"
    >
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
  li: ({ children }) => (
    <li className="leading-relaxed">{children}</li>
  ),
};

export default function TldrBody({ content }: { content: string }) {
  return (
    <aside className="mb-10 rounded-r-xl border-l-4 border-accent bg-surface px-7 py-6">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </aside>
  );
}