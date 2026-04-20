import { useState, useCallback, useRef } from "react";
import { useEditorStore } from "@/store/editorStore";
import { CodeEditor } from "./CodeEditor";
import { Files, Play, Loader2, Download, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

const ALL_RUNNABLE_LANGS = new Set([
  "javascript", "typescript", "python", "python3", "bash", "sh", "shell",
  "java", "cpp", "c", "rust", "go", "php", "ruby", "swift",
]);

const PISTON_URL = "https://emkc.org/api/v2/piston";

const PISTON_MAP: Record<string, { language: string; version: string; filename: string }> = {
  javascript: { language: "javascript", version: "18.15.0", filename: "index.js"    },
  typescript: { language: "typescript", version: "5.0.3",   filename: "index.ts"    },
  python:     { language: "python",     version: "3.10.0",  filename: "main.py"     },
  python3:    { language: "python",     version: "3.10.0",  filename: "main.py"     },
  java:       { language: "java",       version: "15.0.2",  filename: "Main.java"   },
  cpp:        { language: "c++",        version: "10.2.0",  filename: "main.cpp"    },
  c:          { language: "c",          version: "10.2.0",  filename: "main.c"      },
  rust:       { language: "rust",       version: "1.50.0",  filename: "main.rs"     },
  bash:       { language: "bash",       version: "5.2.0",   filename: "script.sh"   },
  sh:         { language: "bash",       version: "5.2.0",   filename: "script.sh"   },
  shell:      { language: "bash",       version: "5.2.0",   filename: "script.sh"   },
  php:        { language: "php",        version: "8.2.3",   filename: "index.php"   },
  go:         { language: "go",         version: "1.16.2",  filename: "main.go"     },
  ruby:       { language: "ruby",       version: "3.0.1",   filename: "main.rb"     },
  swift:      { language: "swift",      version: "5.3.3",   filename: "main.swift"  },
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

export function EditorArea() {
  const {
    openTabs, activeTabId, files,
    updateFileContent, setActivePanel,
    addTerminalLine, togglePanel, panelVisible,
  } = useEditorStore();

  const [running, setRunning] = useState(false);
  const [cursor, setCursor]   = useState({ line: 1, col: 1 });
  const [copied, setCopied]   = useState(false);
  const lastContentRef        = useRef<Record<string, string>>({});

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
    const fromStore = findContent(files);
    if (fromStore) return fromStore;
    return lastContentRef.current[fileId] || "";
  }, [files]);

  const handleRun = async () => {
    if (!activeTab || running) return;

    const content = getFileContent(activeTab.fileId);
    const lang = detectLang(activeTab.fileName, activeTab.language);

    if (!content.trim()) {
      alert("File is empty! Type some code first.");
      return;
    }

    if (!lang) {
      alert("Cannot detect language. Rename your file with the right extension e.g. main.py");
      return;
    }

    const runtime = PISTON_MAP[lang];
    if (!runtime) {
      alert("Language not supported: " + lang);
      return;
    }

    setRunning(true);
    setActivePanel("terminal");
    if (!panelVisible) togglePanel();

    addTerminalLine({ type: "info", content: "Running " + activeTab.fileName + " (" + lang + ")..." });
    addTerminalLine({ type: "info", content: "─────────────────────────────" });

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

      const data = await res.json();
      const run = data.run || {};
      const compile = data.compile || {};

      if (compile.stderr) {
        compile.stderr.split("\n").filter(Boolean).forEach(function(line: string) {
          addTerminalLine({ type: "error", content: line });
        });
        alert("Compile Error:\n\n" + compile.stderr);
      } else {
        if (run.stdout) {
          run.stdout.split("\n").filter(Boolean).forEach(function(line: string) {
            addTerminalLine({ type: "output", content: line });
          });
        }
        if (run.stderr) {
          run.stderr.split("\n").filter(Boolean).forEach(function(line: string) {
            addTerminalLine({ type: "error", content: line });
          });
        }

        const exitCode = run.code || 0;
        addTerminalLine({
          type: exitCode === 0 ? "info" : "error",
          content: "Exited with code " + exitCode,
        });

        const output = run.stdout || run.stderr || "No output";
        alert("Output (" + activeTab.fileName + "):\n\n" + output);
      }
    } catch (err) {
      const msg = "Failed to execute: " + String(err);
      addTerminalLine({ type: "error", content: msg });
      alert(msg);
    }

    setRunning(false);
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
    await navigator.clipboard.writeText(getFileContent(activeTab.fileId));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!activeTab) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background gap-4 select-none p-6">
        <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
          <Files size={32} className="text-muted-foreground/50" />
        </div>
        <div className="text-center">
          <div className="text-base font-semibold text-foreground/70">
            Su Zai Zai Code
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Open a file from the explorer to start coding
          </div>
        </div>
      </div>
    );
  }

  const detectedLang = detectLang(activeTab.fileName, activeTab.language);
  const canRun = ALL_RUNNABLE_LANGS.has(detectedLang);
  const content = getFileContent(activeTab.fileId);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">

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

          <button
            onClick={handleCopy}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
            title="Copy Code"
          >
            {copied
              ? <span className="text-green-400 text-xs">Copied!</span>
              : <Copy size={12} />
            }
          </button>

          <button
            onClick={handleDownload}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
            title="Download File"
          >
            <Download size={12} />
          </button>

          {canRun && (
            <button
              onClick={handleRun}
              disabled={running}
              title={"Run " + activeTab.fileName}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors",
                "bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-600/30",
                running ? "opacity-50 cursor-not-allowed" : ""
              )}
            >
              {running
                ? <Loader2 size={11} className="animate-spin" />
                : <Play size={11} />
              }
              {running ? "Running..." : "Run"}
            </button>
          )}
        </div>
      </div>

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
    </div>
  );
               }
