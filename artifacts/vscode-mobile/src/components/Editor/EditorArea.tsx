import { useState, useCallback, useRef } from "react";
import { useEditorStore } from "@/store/editorStore";
import { CodeEditor } from "./CodeEditor";
import { Files, Play, Loader2, Download, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentEditorView } from "@/lib/editorView";

const ALL_RUNNABLE_LANGS = new Set([
  "javascript", "typescript", "python", "python3", "bash", "sh", "shell",
  "java", "cpp", "c", "rust", "go", "php", "ruby", "swift",
]);

const PISTON_URL = "https://emkc.org/api/v2/piston";

const PISTON_MAP: Record<string, { language: string; version: string; filename: string }> = {
  javascript: { language: "javascript", version: "18.15.0", filename: "index.js"   },
  typescript: { language: "typescript", version: "5.0.3",   filename: "index.ts"   },
  python:     { language: "python",     version: "3.10.0",  filename: "main.py"    },
  python3:    { language: "python",     version: "3.10.0",  filename: "main.py"    },
  java:       { language: "java",       version: "15.0.2",  filename: "Main.java"  },
  cpp:        { language: "c++",        version: "10.2.0",  filename: "main.cpp"   },
  c:          { language: "c",          version: "10.2.0",  filename: "main.c"     },
  rust:       { language: "rust",       version: "1.50.0",  filename: "main.rs"    },
  bash:       { language: "bash",       version: "5.2.0",   filename: "script.sh"  },
  sh:         { language: "bash",       version: "5.2.0",   filename: "script.sh"  },
  shell:      { language: "bash",       version: "5.2.0",   filename: "script.sh"  },
  php:        { language: "php",        version: "8.2.3",   filename: "index.php"  },
  go:         { language: "go",         version: "1.16.2",  filename: "main.go"    },
  ruby:       { language: "ruby",       version: "3.0.1",   filename: "main.rb"    },
  swift:      { language: "swift",      version: "5.3.3",   filename: "main.swift" },
};

function detectLang(fileName: string, language?: string): string {
  if (language && language !== "plaintext") return language.toLowerCase();
  if (fileName.endsWith(".py"))    return "python";
  if (fileName.endsWith(".js"))    return "javascript";
  if (fileName.endsWith(".ts"))    return "typescript";
  if (fileName.endsWith(".tsx"))   return "typescript";
  if (fileName.endsWith(".jsx"))   return "javascript";
  if (fileName.endsWith(".java"))  return "java";
  if (fileName.endsWith(".cpp"))   return "cpp";
  if (fileName.endsWith(".c"))     return "c";
  if (fileName.endsWith(".rs"))    return "rust";
  if (fileName.endsWith(".go"))    return "go";
  if (fileName.endsWith(".rb"))    return "ruby";
  if (fileName.endsWith(".php"))   return "php";
  if (fileName.endsWith(".sh"))    return "bash";
  if (fileName.endsWith(".swift")) return "swift";
  return "";
}

type OutputLine = {
  id: string;
  type: "info" | "output" | "error" | "success";
  content: string;
};

export function EditorArea() {
  const {
    openTabs, activeTabId, files,
    updateFileContent,
  } = useEditorStore();

  const [running, setRunning]         = useState(false);
  const [cursor, setCursor]           = useState({ line: 1, col: 1 });
  const [copied, setCopied]           = useState(false);
  const [outputLines, setOutputLines] = useState<OutputLine[]>([]);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const lastContentRef                = useRef<Record<string, string>>({});
  const outputBottomRef               = useRef<HTMLDivElement>(null);
  const dragRef                       = useRef<{ startY: number; startH: number } | null>(null);

  const activeTab = openTabs.find((t) => t.id === activeTabId);

  const addOutput = (type: OutputLine["type"], content: string) => {
    setOutputLines(prev => [
      ...prev,
      { id: Math.random().toString(36).slice(2), type, content }
    ]);
    setTimeout(() => {
      outputBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const getContent = (): string => {
    const view = getCurrentEditorView();
    if (view) return view.state.doc.toString();
    if (activeTab && lastContentRef.current[activeTab.fileId]) {
      return lastContentRef.current[activeTab.fileId];
    }
    if (!activeTab) return "";
    const findContent = (nodes: typeof files): string => {
      for (const node of nodes) {
        if (node.id === activeTab.fileId) return node.content || "";
        if (node.children) {
          const found = findContent(node.children);
          if (found !== "") return found;
        }
      }
      return "";
    };
    return findContent(files);
  };

  const handleRun = async () => {
    if (!activeTab || running) return;

    const content = getContent();
    const lang = detectLang(activeTab.fileName, activeTab.language);

    setOutputLines([]);

    if (!content.trim()) {
      addOutput("error", "File is empty! Type some code first.");
      return;
    }

    if (!lang) {
      addOutput("error", "Cannot detect language. Use correct file extension e.g. main.py");
      return;
    }

    const runtime = PISTON_MAP[lang];
    if (!runtime) {
      addOutput("error", "Language not supported: " + lang);
      return;
    }

    setRunning(true);
    addOutput("info", "▶ Running " + activeTab.fileName + " (" + lang + ")...");
    addOutput("info", "─────────────────────────────");

    try {
      const res = await fetch(PISTON_URL + "/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: runtime.language,
          version: runtime.version,
          files: [{ name: runtime.filename, content: content }],
          run_timeout: 10000,
          compile_timeout: 10000,
        }),
      });

      const data    = await res.json();
      const run     = data.run     || {};
      const compile = data.compile || {};

      if (compile.stderr) {
        compile.stderr.split("\n").forEach((line: string) => {
          addOutput("error", line || " ");
        });
      } else {
        if (run.stdout) {
          run.stdout.split("\n").forEach((line: string) => {
            addOutput("output", line || " ");
          });
        }
        if (run.stderr) {
          run.stderr.split("\n").forEach((line: string) => {
            addOutput("error", line || " ");
          });
        }
        const code = run.code ?? 0;
        addOutput(
          code === 0 ? "success" : "error",
          "─── Exited with code " + code + " ───"
        );
      }
    } catch (err) {
      addOutput("error", "Failed to execute: " + String(err));
    }

    setRunning(false);
  };

  const handleDownload = () => {
    if (!activeTab) return;
    const content = getContent();
    const blob = new Blob([content], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = activeTab.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!activeTab) return;
    await navigator.clipboard.writeText(getContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    dragRef.current = { startY: clientY, startH: terminalHeight };
  };

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!dragRef.current) return;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const diff = dragRef.current.startY - clientY;
    const newH = Math.min(500, Math.max(80, dragRef.current.startH + diff));
    setTerminalHeight(newH);
  };

  const handleDragEnd = () => {
    dragRef.current = null;
  };

  const lineColors: Record<OutputLine["type"], string> = {
    info:    "text-blue-400",
    output:  "text-gray-100",
    error:   "text-red-400",
    success: "text-green-400",
  };

  if (!activeTab) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background gap-4 select-none p-6">
        <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
          <Files size={32} className="text-muted-foreground/50" />
        </div>
        <div className="text-center">
          <div className="text-base font-semibold text-foreground/70">Su Zai Zai Code</div>
          <div className="text-sm text-muted-foreground mt-1">
            Open a file from the explorer to start coding
          </div>
        </div>
      </div>
    );
  }

  const detectedLang = detectLang(activeTab.fileName, activeTab.language);
  const canRun       = ALL_RUNNABLE_LANGS.has(detectedLang);
  const findContent  = (nodes: typeof files): string => {
    for (const node of nodes) {
      if (node.id === activeTab.fileId) return node.content || "";
      if (node.children) {
        const found = findContent(node.children);
        if (found !== "") return found;
      }
    }
    return "";
  };
  const content = lastContentRef.current[activeTab.fileId] || findContent(files);

  return (
    <div
      className="flex flex-col h-full overflow-hidden bg-background"
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      {/* Top bar */}
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
          <span className="text-muted-foreground font-mono text-xs hidden sm:block">
            {cursor.line}:{cursor.col}
          </span>

          <button onClick={handleCopy}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
            title="Copy Code">
            {copied
              ? <span className="text-green-400 text-xs">Copied!</span>
              : <Copy size={12} />}
          </button>

          <button onClick={handleDownload}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
            title="Download File">
            <Download size={12} />
          </button>

          {canRun && (
            <button
              onClick={handleRun}
              disabled={running}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors",
                "bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-600/30",
                running ? "opacity-50 cursor-not-allowed" : ""
              )}
            >
              {running ? <Loader2 size={11} className="animate-spin" /> : <Play size={11} />}
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
          language={detectedLang || activeTab.language}
          onChange={(newContent) => {
            lastContentRef.current[activeTab.fileId] = newContent;
            updateFileContent(activeTab.fileId, newContent);
          }}
          onCursorChange={(line, col) => setCursor({ line, col })}
        />
      </div>

      {/* Drag handle */}
      <div
        className="h-2 bg-border hover:bg-primary/50 cursor-row-resize shrink-0 transition-colors flex items-center justify-center"
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <div className="w-8 h-0.5 bg-muted-foreground/30 rounded-full" />
      </div>

      {/* Terminal panel */}
      <div
        className="shrink-0 flex flex-col bg-[#0d0d0d] border-t border-border font-mono text-xs"
        style={{ height: terminalHeight }}
      >
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-800 shrink-0">
          <span className="text-gray-400 font-sans text-xs font-semibold tracking-wider">TERMINAL</span>
          <div className="flex items-center gap-2">
            {canRun && (
              <button
                onClick={handleRun}
                disabled={running}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-green-700 hover:bg-green-600 text-white disabled:opacity-50 transition-colors"
              >
                {running ? <Loader2 size={10} className="animate-spin" /> : <Play size={10} />}
                {running ? "Running..." : "▶ Run"}
              </button>
            )}
            <button
              onClick={() => setOutputLines([])}
              className="p-1 rounded text-gray-500 hover:text-gray-300 transition-colors"
              title="Clear terminal"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {outputLines.length === 0 ? (
            <div className="text-gray-600 text-xs mt-4 text-center">
              Click ▶ Run to execute your code
            </div>
          ) : (
            outputLines.map((line) => (
              <div
                key={line.id}
                className={cn("whitespace-pre-wrap break-all leading-5", lineColors[line.type])}
              >
                {line.content}
              </div>
            ))
          )}
          <div ref={outputBottomRef} />
        </div>
      </div>
    </div>
  );
    }
