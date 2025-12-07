/**
 * Lightweight markdown parser for cards
 * Supports: h1-h3, bold, italic, inline code, code blocks, newlines
 */

export interface ParsedNode {
  type: "text" | "bold" | "italic" | "code" | "heading" | "codeblock" | "line-break";
  content?: string;
  level?: number; // for headings
  children?: ParsedNode[];
}

export function parseMarkdown(text: string): ParsedNode[] {
  if (!text) return [];

  const lines = text.split("\n");
  const nodes: ParsedNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for code blocks (triple backticks)
    if (line.trim().startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      nodes.push({
        type: "codeblock",
        content: codeLines.join("\n"),
      });
      continue;
    }

    // Check for headings
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      nodes.push({
        type: "heading",
        level,
        children: parseInline(headingMatch[2]),
      });
      continue;
    }

    // Regular line with inline formatting
    if (line.trim()) {
      nodes.push({
        type: "line-break",
        children: parseInline(line),
      });
    } else if (nodes.length > 0 && nodes[nodes.length - 1].type !== "line-break") {
      // Only add line break if the previous node wasn't already a line break
      nodes.push({
        type: "line-break",
        content: "",
      });
    }
  }

  return nodes;
}

function parseInline(text: string): ParsedNode[] {
  const nodes: ParsedNode[] = [];
  let currentText = "";

  let i = 0;
  while (i < text.length) {
    // Bold: **text**
    if (text.substring(i, i + 2) === "**") {
      if (currentText) {
        nodes.push({ type: "text", content: currentText });
        currentText = "";
      }
      const endIndex = text.indexOf("**", i + 2);
      if (endIndex !== -1) {
        const boldContent = text.substring(i + 2, endIndex);
        nodes.push({
          type: "bold",
          children: parseInline(boldContent),
        });
        i = endIndex + 2;
        continue;
      }
    }

    // Italic: *text* or _text_
    if ((text[i] === "*" || text[i] === "_") && i + 1 < text.length) {
      const delimiter = text[i];
      if (currentText) {
        nodes.push({ type: "text", content: currentText });
        currentText = "";
      }
      const endIndex = text.indexOf(delimiter, i + 1);
      if (endIndex !== -1) {
        const italicContent = text.substring(i + 1, endIndex);
        nodes.push({
          type: "italic",
          children: parseInline(italicContent),
        });
        i = endIndex + 1;
        continue;
      }
    }

    // Inline code: `text`
    if (text[i] === "`") {
      if (currentText) {
        nodes.push({ type: "text", content: currentText });
        currentText = "";
      }
      const endIndex = text.indexOf("`", i + 1);
      if (endIndex !== -1) {
        const codeContent = text.substring(i + 1, endIndex);
        nodes.push({
          type: "code",
          content: codeContent,
        });
        i = endIndex + 1;
        continue;
      }
    }

    currentText += text[i];
    i++;
  }

  if (currentText) {
    nodes.push({ type: "text", content: currentText });
  }

  return nodes;
}
