import { useMemo, useCallback, useState } from "react";
import { RefreshCw, ExternalLink } from "lucide-react";

interface LivePreviewProps {
  content: string;
  language: string;
  fileName: string;
}

function markdownToHtml(md: string): string {
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Headings
  html = html.replace(/^###### (.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^##### (.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Horizontal rule
  html = html.replace(/^-{3,}$/gm, "<hr>");

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>");

  // Code blocks
  html = html.replace(/```[\w]*\n([\s\S]*?)```/g, "<pre><code>$1</code></pre>");

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Bold + italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");
  html = html.replace(/_(.+?)_/g, "<em>$1</em>");

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, "<del>$1</del>");

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%">');

  // Unordered lists
  html = html.replace(/^[-*+] (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, (match) => {
    if (!match.startsWith("<ul>")) return "<ul>" + match + "</ul>";
    return match;
  });
  html = html.replace(/<\/ul>\s*<ul>/g, "");

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, "<oli>$1</oli>");
  html = html.replace(/(<oli>[\s\S]*?<\/oli>)/g, (match) => {
    return "<ol><li>" + match.replace(/<\/?oli>/g, "") + "</li></ol>";
  });
  html = html.replace(/<\/ol>\s*<ol>/g, "");

  // Paragraphs — wrap lines not already wrapped in block elements
  const lines = html.split("\n");
  const block = new Set(["<h1","<h2","<h3","<h4","<h5","<h6","<hr","<ul","<ol","<li","<pre","<blockquote"]);
  const result: string[] = [];
  let para: string[] = [];

  const flushPara = () => {
    if (para.length > 0) {
      const text = para.join(" ").trim();
      if (text) result.push(`<p>${text}</p>`);
      para = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushPara();
      continue;
    }
    const isBlock = [...block].some((b) => trimmed.startsWith(b));
    if (isBlock) {
      flushPara();
      result.push(trimmed);
    } else {
      para.push(trimmed);
    }
  }
  flushPara();

  return result.join("\n");
}

function buildHtmlDocument(content: string, language: string): string {
  if (language === "html") return content;

  const body = markdownToHtml(content);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    font-size: 15px;
    line-height: 1.7;
    color: #1f2937;
    background: #ffffff;
    max-width: 780px;
    margin: 0 auto;
    padding: 32px 24px 64px;
  }
  h1,h2,h3,h4,h5,h6 {
    margin: 1.4em 0 0.4em;
    line-height: 1.3;
    font-weight: 700;
    color: #111827;
  }
  h1 { font-size: 2em; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.3em; }
  h2 { font-size: 1.5em; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.2em; }
  h3 { font-size: 1.25em; }
  p  { margin: 0.8em 0; }
  a  { color: #2563eb; }
  code {
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    padding: 1px 5px;
    font-family: "Fira Code", "Cascadia Code", Consolas, monospace;
    font-size: 0.9em;
    color: #dc2626;
  }
  pre {
    background: #1e293b;
    color: #e2e8f0;
    border-radius: 8px;
    padding: 16px;
    overflow-x: auto;
    margin: 1em 0;
  }
  pre code {
    background: none;
    border: none;
    color: inherit;
    padding: 0;
    font-size: 0.88em;
  }
  blockquote {
    border-left: 4px solid #60a5fa;
    margin: 1em 0;
    padding: 0.5em 1em;
    background: #eff6ff;
    color: #374151;
    border-radius: 0 6px 6px 0;
  }
  ul, ol { padding-left: 1.5em; margin: 0.5em 0; }
  li { margin: 0.2em 0; }
  hr { border: none; border-top: 2px solid #e5e7eb; margin: 1.5em 0; }
  img { max-width: 100%; border-radius: 6px; }
  strong { font-weight: 700; }
  del { opacity: 0.6; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; }
  th, td { border: 1px solid #e5e7eb; padding: 6px 12px; text-align: left; }
  th { background: #f9fafb; font-weight: 600; }
</style>
</head>
<body>${body}</body>
</html>`;
}

export function LivePreview({ content, language, fileName }: LivePreviewProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const srcDoc = useMemo(() => buildHtmlDocument(content, language), [content, language, refreshKey]);

  const handleOpenNew = useCallback(() => {
    const blob = new Blob([srcDoc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, [srcDoc]);

  const isSupported = language === "html" || language === "markdown";

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground select-none bg-muted/20">
        <div className="text-3xl">👁</div>
        <div className="text-center">
          <div className="text-sm font-medium text-foreground/60">No preview available</div>
          <div className="text-xs text-muted-foreground/60 mt-1">Preview works for HTML and Markdown files</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border-l border-border bg-white">
      {/* Preview toolbar */}
      <div className="flex items-center justify-between px-3 py-1 border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground tracking-widest">PREVIEW</span>
          <span className="text-xs text-muted-foreground font-mono truncate max-w-[140px]">{fileName}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
            title="Refresh"
          >
            <RefreshCw size={12} />
          </button>
          <button
            onClick={handleOpenNew}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
            title="Open in new tab"
          >
            <ExternalLink size={12} />
          </button>
        </div>
      </div>

      {/* iframe */}
      <div className="flex-1 overflow-hidden">
        <iframe
          key={refreshKey}
          srcDoc={srcDoc}
          title="Live Preview"
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
        />
      </div>
    </div>
  );
}
