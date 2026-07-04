import React from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-body leading-relaxed text-slate-350 select-text overflow-x-auto text-[13px]">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
export default MarkdownRenderer;
