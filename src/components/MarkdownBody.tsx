import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import CodeBlock from "./CodeBlock";

type Props = {
  content: string;
  baseUrl: string;
};

function resolveImageSrc(src: string | undefined, baseUrl: string) {
  if (!src) return "";
  if (/^(https?:)?\/\//i.test(src) || /^(data:|blob:)/i.test(src)) {
    return src;
  }

  return (
    baseUrl.replace(/\/$/, "") +
    "/" +
    src.replace(/^\/+/, "")
  );
}

export default function MarkdownBody({ content, baseUrl }: Props) {
  return (
    <div className="prose-lab">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[[rehypeHighlight, { ignoreMissing: true }]]}
        components={{
          pre: CodeBlock,
          img: ({ src, alt }) => (
            <img
              src={resolveImageSrc(src, baseUrl)}
              alt={alt ?? ""}
              loading="lazy"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}