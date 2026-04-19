import { useState, useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";
import { CodeEditor } from "./CodeEditor";
import { Files, Play, Loader2, Download, Copy, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const ALL_RUNNABLE_LANGS = new Set([
  "javascript", "typescript", "python", "python3", "bash", "sh", "shell",
  "java", "cpp", "c", "rust", "go", "php", "ruby", "swift",
]);

const PISTON_URL = "https://emkc.org/api/v2/piston";
const PISTON_MAP: Record<string, { language: string; version: string; filename: string }> = {
  javascript: { language: "javascript", version: "18.15.0", filename: "index.js" },
  typescript: { language: "typescript", version: "5.0.3",   filename: "index.ts" },
  python:     { language: "python",     version: "3.10.0",  filename: "main.py"  },
  python3:    { language: "python",     version: "3.10.0",  filename: "main.py"  },
  java:       { language: "java",       version: "15.0.2",  filename: "Main.java" },
  cpp:        { language: "c++",        version: "10.2.0",  filename: "main.cpp" },
  c:          { language: "c",          version: "10.2.0",  filename: "main.c"   },
  rust:       { language: "rust",       version: "1.50.0",  filename: "main.rs"  },
  bash:       { language: "bash",       version: "5.2.0",   filename: "script.sh" },
  sh:         { language: "bash",       version: "5.2.0",   filename: "script.sh" },
  shell:      { language: "bash",       version: "5.2.0",   filename: "script.sh" },
  php:        { language: "php",        version: "8.2.3",   filename: "index.php" },
  go:         { language: "go",         version: "1.16.2",  filename: "main.go"  },
  ruby:       { language: "ruby",       version: "3.0.1",   filename: "main.rb"  },
  swift:      { language: "swift",      version: "5.3.3",   filename: "main.swift" },
};

export function EditorArea() {
  const { openTabs, activeTabId, files, updateFileContent, setActivePanel, addTerminalLine, togglePanel, panelVisible } = useEditorStore();
  const [running, setRunning] = useState(false);
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

  const handleRun = async () => {
    if (!activeTab || running) return;
    const content = getFileContent(activeTab.fileId);
    if (!content.trim()) return;

    const lang = (activeTab.language || "javascript").toLowerCase();
    const runtime = PISTON_MAP[lang];

    setRunning(true);
    setActivePanel("terminal");
    if (!panelVisible) togglePanel();

    addTerminalLine({ type: "info", content: `▶ Running ${activeTab.fileName} (${lang})...` });
    addTerminalLine({ type: "info", content: "─────────────────────────────" });

    try {
      if (runtime) {
        const res = await fetch(`${PISTON_URL}/execute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: runtime.language,
            version: runtime.version,
            files: [{ name: runtime.filename, content }],
            run_timeout: 10000,
            compile_timeout: 10000,
          }),
        });
        const data = await res.json();
        const run = data.run ?? {};
        const compile = data.compile ?? {};

        if (compile.stderr) {
          compile.stderr.split("\n").filter(Boolean).forEach((line: string) =>
            addTerminalLine({ type: "error", content: line })
          );
        } else {
          if (run.stdout) {
            run.stdout.split("\n").filter(Boolean).forEach((line: string) =>
              addTerminalLine({ type: "output", content: line })
            );
          }
          if (run.stderr) {
            run.stderr.split("\n").filter(Boolean).forEach((line: string) =>
              addTerminalLine({ type: "error", content: line })
            );
          }
          addTerminalLine({
            type: run.code === 0 ? "info" : "error",
            content: `─── Exited with code ${run.code ?? 0} ───`,
          });
        }
      } else {
        const res = await fetch("/api/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: content, language: lang, filename: activeTab.fileName }),
        });
        const data = await res.json();
        if (data.stdout) addTerminalLine({ type: "output", content: data.stdout });
        if (data.stderr) addTerminalLine({ type: "error", content: data.stderr });
        addTerminalLine({
          type: data.exitCode === 0 ? "info" : "error",
          content: `─── Exited with code ${data.exitCode} (${(data.executionTime || 0).toFixed(2)}s) ───`,
        });
      }
    } catch (err) {
      addTerminalLine({ type: "error", content: `Failed to execute: ${String(err)}` });
    } finally {
      setRunning(false);
    }
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
              disabled={running}
              title={`Run ${activeTab.fileName} (Ctrl+Enter)`}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors",
                "bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-600/30",
                running && "opacity-50 cursor-not-allowed"
              )}
            >
              {running ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <Play size={11} />
              )}
              {running ? "Running..." : "Run"}
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
