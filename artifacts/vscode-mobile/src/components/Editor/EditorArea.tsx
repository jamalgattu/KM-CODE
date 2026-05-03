import { useState, useCallback, useRef } from "react";
import { useEditorStore } from "@/store/editorStore";
import { getLanguageFromPath } from "@/types/editor";
import { CodeEditor } from "./CodeEditor";
import { LivePreview } from "./LivePreview";
import { Files, Play, Loader2, Download, Copy, Eye, EyeOff, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { toPng } from "html-to-image";

const ALL_RUNNABLE_LANGS = new Set([
  "javascript", "typescript", "python", "python3", "bash", "sh", "shell",
  "java", "cpp", "c", "rust", "go", "php", "ruby", "swift",
]);

const PREVIEW_LANGS = new Set(["html", "markdown"]);

export function EditorArea() {
  const {
    openTabs, activeTabId, files, updateFileContent, executeRun, isRunning,
    togglePanel, panelVisible, setActivePanel, toggleSidebar, setActiveSidePanel, sidebarVisible,
  } = useEditorStore();
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [previewVisible, setPreviewVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [screenshotting, setScreenshotting] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const activeTab = openTabs.find((t) => t.id === activeTabId);

  const getFileContent = useCallback((fileId: string): string => {
    const findContent = (nodes: typeof files): string | null => {
      for (const node of nodes) {
        if (node.id === fileId) return node.content ?? "";
        if (node.children) {
          const found = findContent(node.children);
          if (found !== null) return found;
        }
      }
      return null;
    };
    return findContent(files) ?? "";
  }, [files]);

  const handleRun = () => {
    if (!activeTab || isRunning) return;
    setActivePanel("output");
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

  const handleScreenshot = useCallback(async () => {
    if (!captureRef.current || screenshotting) return;
    setScreenshotting(true);
    try {
      const dataUrl = await toPng(captureRef.current, {
        cacheBust: true,
        pixelRatio: Math.min(window.devicePixelRatio || 1, 3),
        backgroundColor: "var(--background)",
      });
      const link = document.createElement("a");
      link.download = `km-code-debug-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      if (activeTab) {
        const content = getFileContent(activeTab.fileId);
        const fileLang = (activeTab.language || getLanguageFromPath(activeTab.fileName)).toLowerCase();
        await navigator.clipboard.writeText(
          `File: ${activeTab.fileName}\n\`\`\`${fileLang}\n${content}\n\`\`\``
        ).catch(() => {});
      }
    } finally {
      setScreenshotting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenshotting, activeTab]);

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
            {
              label: "New File",
              hint: "Create a file with a starter template",
              action: () => { if (!sidebarVisible) toggleSidebar(); setActiveSidePanel("explorer"); },
            },
            {
              label: "Open Terminal",
              hint: "Type 'run' to execute code",
              action: () => { setActivePanel("terminal"); if (!panelVisible) togglePanel(); },
            },
            {
              label: "Search Files",
              hint: "Find across all open files",
              action: () => { if (!sidebarVisible) toggleSidebar(); setActiveSidePanel("search"); },
            },
            {
              label: "Source Control",
              hint: "View git changes",
              action: () => { if (!sidebarVisible) toggleSidebar(); setActiveSidePanel("git"); },
            },
          ].map(({ label, hint, action }) => (
            <button
              key={label}
              onClick={action}
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
  // Always resolve language — old persisted tabs may have language: undefined
  const lang = (activeTab.language || getLanguageFromPath(activeTab.fileName)).toLowerCase();
  const canRun = ALL_RUNNABLE_LANGS.has(lang);
  const canPreview = PREVIEW_LANGS.has(lang);

  return (
    <div ref={captureRef} className="flex flex-col h-full overflow-hidden bg-background">
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

          {/* Preview toggle — always visible for HTML/Markdown */}
          {canPreview && (
            <button
              onClick={() => setPreviewVisible((v) => !v)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 sm:py-0.5 rounded text-xs font-medium transition-colors border",
                previewVisible
                  ? "bg-blue-600/25 text-blue-400 border-blue-600/40"
                  : "bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 border-blue-600/20"
              )}
              title={previewVisible ? "Hide Preview" : "Show Split Preview"}
            >
              {previewVisible ? <EyeOff size={12} /> : <Eye size={12} />}
              <span className="hidden xs:inline">Preview</span>
            </button>
          )}

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="p-2 sm:p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
            title="Copy Code"
          >
            {copied ? (
              <span className="text-[10px] text-green-400 font-mono">✓</span>
            ) : (
              <Copy size={13} className="sm:w-3 sm:h-3" />
            )}
          </button>

          {/* Screenshot for AI debugging */}
          <button
            onClick={handleScreenshot}
            disabled={screenshotting}
            className="p-2 sm:p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors disabled:opacity-50"
            title="Screenshot for AI Debug"
          >
            {screenshotting ? (
              <Loader2 size={13} className="animate-spin sm:w-3 sm:h-3" />
            ) : (
              <Camera size={13} className="sm:w-3 sm:h-3" />
            )}
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-2 sm:p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
            title="Download File"
          >
            <Download size={13} className="sm:w-3 sm:h-3" />
          </button>

          {/* Run button */}
          {canRun && (
            <button
              onClick={handleRun}
              disabled={isRunning}
              title={`Run ${activeTab.fileName} (Ctrl+Enter)`}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 sm:px-2 sm:py-0.5 rounded text-xs font-medium transition-colors",
                "bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-600/30",
                isRunning && "opacity-50 cursor-not-allowed"
              )}
            >
              {isRunning ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Play size={12} />
              )}
              {isRunning ? "Running..." : "Run"}
            </button>
          )}
        </div>
      </div>

      {/* Editor + optional split preview */}
      <div className={cn(
        "flex-1 overflow-hidden",
        previewVisible && canPreview ? "flex flex-col md:flex-row" : "block"
      )}>
        {/* Editor pane */}
        <div className={cn(
          "overflow-hidden",
          previewVisible && canPreview ? "flex-1 min-h-0 min-w-0" : "h-full"
        )}>
          <CodeEditor
            key={activeTab.fileId}
            fileId={activeTab.fileId}
            content={content}
            language={lang}
            onChange={(newContent) => updateFileContent(activeTab.fileId, newContent)}
            onCursorChange={(line, col) => setCursor({ line, col })}
          />
        </div>

        {/* Live preview pane — full width below editor on mobile, half width beside on desktop */}
        {previewVisible && canPreview && (
          <div className="h-64 md:h-auto md:w-1/2 min-w-0 overflow-hidden shrink-0">
            <LivePreview
              content={content}
              language={lang}
              fileName={activeTab.fileName}
            />
          </div>
        )}
      </div>
    </div>
  );
}
