import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children, className }: { children: string; className?: string }) {
  if (!children.trim()) return null;
  return (
    <div className={className ? `prose-wcs ${className}` : "prose-wcs"}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        allowedElements={[
          "p", "a", "em", "strong", "code", "pre", "blockquote",
          "ul", "ol", "li", "h2", "h3", "h4", "hr", "br",
          "table", "thead", "tbody", "tr", "th", "td", "del",
          // GFM footnotes — Wikipedia-style inline citations
          "sup", "section",
        ]}
        unwrapDisallowed
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
