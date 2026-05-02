import { useState, useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";
import { CodeEditor } from "./CodeEditor";
import { Files, Play, Loader2, Download, Copy, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const ALL_RUNNABLE_LANGS = new Set([
  "javascript", "typescript", "python", "python3", "bash", "sh", "shell",
  "java", "cpp", "c", "rust", "go", "php", "ruby", "swift",
]);

export function EditorArea() {
  const { openTabs, activeTabId, files, updateFileContent, executeRun, isRunning, togglePanel, panelVisible, setActivePanel } = useEditorStore();
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [previewVisible, setPreviewVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeTab = openTabs.find((t) => t.id === activeTabId);

  const getFileContent = useCallback((fileId: string): string => {
    const findContent = (nodes: typeof files): string => {
      for (const node of nodes) {
        if (node.id === fileId) return node.content || "";
        if (node.children) {
          const found = findContent(node.children);
          if (found !== "") return found;
        }
      }
      return "";
    };
    return findContent(files);
  }, [files]);

  const handleRun = () => {
    if (!activeTab || isRunning) return;
    if (!panelVisible) togglePanel();
    executeRun();
  };

  const handleDownload = () => {
    if (!activeTab) return;
    const content = getFileContent(activeTab.fileId);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeTab.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!activeTab) return;
    const content = getFileContent(activeTab.fileId);
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handlePreviewToggle = () => {
    if (!previewVisible) {
      setActivePanel("preview" as any);
      if (!panelVisible) togglePanel();
    }
    setPreviewVisible(!previewVisible);
  };

  if (!activeTab) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background gap-6 select-none">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center">
            <Files size={40} className="text-muted-foreground/50" />
          </div>
          <div className="text-center">
            <div className="text-base font-semibold text-foreground/70">KM Code Editor</div>
            <div className="text-sm text-muted-foreground mt-1">Mobile-first. Open a file to start coding.</div>
          </div>
          <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground mt-2">
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs border border-border">⌘</kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs border border-border">P</kbd>
              <span>Quick Open File</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs border border-border">⌘</kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs border border-border">`</kbd>
              <span>Toggle Terminal</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 max-w-sm px-4">
          {[
            { label: "New File", hint: "Create a file with a starter template" },
            { label: "Open Terminal", hint: "Type 'run' to execute code" },
            { label: "Search Files", hint: "Find across all open files" },
            { label: "Source Control", hint: "View git changes" },
          ].map(({ label, hint }) => (
            <button
              key={label}
              className="text-left p-3 rounded-lg border border-border hover:bg-sidebar-accent transition-colors"
            >
              <div className="text-sm font-medium text-foreground">{label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const content = getFileContent(activeTab.fileId);
  const canRun = ALL_RUNNABLE_LANGS.has((activeTab.language || "").toLowerCase());
  const isHTML = (activeTab.language || "").toLowerCase() === "html";

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Breadcrumb + actions */}
      <div className="flex items-center gap-1 px-3 py-1 text-xs text-muted-foreground border-b border-border/50 bg-background shrink-0">
        <div className="flex-1 flex items-center gap-1 min-w-0 overflow-hidden">
          {activeTab.filePath.split("/").filter(Boolean).map((part, idx, arr) => (
            <span key={idx} className="flex items-center gap-1 shrink-0">
              {idx > 0 && <span className="text-border">/</span>}
              <span className={idx === arr.length - 1 ? "text-foreground" : ""}>{part}</span>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {/* Cursor position */}
          <span className="text-muted-foreground font-mono text-xs hidden sm:block">
            {cursor.line}:{cursor.col}
          </span>

          {/* HTML Preview toggle */}
          {isHTML && (
            <button
              onClick={() => {
                setActivePanel("preview" as any);
                if (!panelVisible) togglePanel();
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-600/30"
              title="Toggle HTML Preview"
            >
              <Eye size={11} />
              Preview
            </button>
          )}

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
            title="Copy Code"
          >
            {copied ? (
              <span className="text-[10px] text-green-400 font-mono">Copied!</span>
            ) : (
              <Copy size={12} />
            )}
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
            title="Download File"
          >
            <Download size={12} />
          </button>

          {/* Run button */}
          {canRun && (
            <button
              onClick={handleRun}
              disabled={isRunning}
              title={`Run ${activeTab.fileName} (Ctrl+Enter)`}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors",
                "bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-600/30",
                isRunning && "opacity-50 cursor-not-allowed"
              )}
            >
              {isRunning ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <Play size={11} />
              )}
              {isRunning ? "Running..." : "Run"}
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <CodeEditor
          key={activeTab.fileId}
          fileId={activeTab.fileId}
          content={content}
          language={activeTab.language}
          onChange={(newContent) => updateFileContent(activeTab.fileId, newContent)}
          onCursorChange={(line, col) => setCursor({ line, col })}
        />
      </div>
    </div>
  );
}
