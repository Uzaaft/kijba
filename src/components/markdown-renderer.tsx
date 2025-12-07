"use client";

import { parseMarkdown } from "@/lib/markdown";
import type { ParsedNode } from "@/lib/markdown";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const nodes = parseMarkdown(content);

  return (
    <div className={className}>
      {nodes.map((node, idx) => {
        if (node.type === "heading") {
          const headingClass = {
            1: "text-lg font-bold",
            2: "text-base font-bold",
            3: "text-sm font-semibold",
          }[node.level || 1];
          return (
            <div key={idx} className={`${headingClass} mt-1 mb-0.5`}>
              {renderNodeChildren(node.children || [])}
            </div>
          );
        }

        if (node.type === "codeblock") {
          return (
            <pre
              key={idx}
              className="bg-gray-800 text-gray-100 text-xs p-2 rounded mt-1 mb-1 overflow-x-auto whitespace-pre-wrap wrap-break-word"
            >
              <code>{node.content}</code>
            </pre>
          );
        }

        if (node.type === "line-break") {
          return (
            <div key={idx} className="wrap-break-word">
              {renderNodeChildren(node.children || [])}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

function renderNodeChildren(nodes: ParsedNode[]): React.ReactNode {
  return nodes.map((node, idx) => {
    if (node.type === "text") {
      return <span key={idx}>{node.content}</span>;
    }

    if (node.type === "bold") {
      return (
        <strong key={idx} className="font-bold">
          {renderNodeChildren(node.children || [])}
        </strong>
      );
    }

    if (node.type === "italic") {
      return (
        <em key={idx} className="italic">
          {renderNodeChildren(node.children || [])}
        </em>
      );
    }

    if (node.type === "code") {
      return (
        <code
          key={idx}
          className="bg-gray-700 text-gray-100 px-1 rounded text-xs font-mono"
        >
          {node.content}
        </code>
      );
    }

    return null;
  });
}
