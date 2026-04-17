import { useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { CodeEditor } from "./CodeEditor";
import { Files, Play, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const RUNNABLE_LANGS = new Set(["javascript", "typescript", "python", "python3", "bash", "sh"]);

export function EditorArea() {
  const { openTabs, activeTabId, files, updateFileContent, setActivePanel, addTerminalLine } = useEditorStore();
  const [running, setRunning] = useState(false);

  const activeTab = openTabs.find((t) => t.id === activeTabId);

  const getFileContent = (fileId: string): string => {
    const findContent = (nodes: typeof files): string => {
      for (const node of nodes) {
        if (node.id === fileId) return node.content || "";
        if (node.children) {
          const found = findContent(node.children);
          if (found !== null) return found;
        }
      }
      return "";
    };
    return findContent(files);
  };

  const handleRun = async () => {
    if (!activeTab || running) return;
    const content = getFileContent(activeTab.fileId);
    if (!content.trim()) return;

    setRunning(true);
    setActivePanel("terminal");

    addTerminalLine({ type: "info", content: `Running ${activeTab.fileName}...` });

    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: content,
          language: activeTab.language || "javascript",
          filename: activeTab.fileName,
        }),
      });
      const data = await res.json();

      if (data.stdout) {
        addTerminalLine({ type: "output", content: data.stdout });
      }
      if (data.stderr) {
        addTerminalLine({ type: "error", content: data.stderr });
      }
      addTerminalLine({
        type: data.exitCode === 0 ? "info" : "error",
        content: `Process exited with code ${data.exitCode} (${data.executionTime.toFixed(2)}s)`,
      });
    } catch (err) {
      addTerminalLine({ type: "error", content: `Failed to execute: ${String(err)}` });
    } finally {
      setRunning(false);
    }
  };

  if (!activeTab) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background gap-6 select-none">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center">
            <Files size={40} className="text-muted-foreground/50" />
          </div>
          <div className="text-center">
            <div className="text-base font-semibold text-foreground/70">Code Editor</div>
            <div className="text-sm text-muted-foreground mt-1">VS Code for Mobile</div>
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
            { label: "New File", hint: "Create a new file in explorer" },
            { label: "Open Terminal", hint: "Start typing commands" },
            { label: "Search Files", hint: "Find across all files" },
            { label: "Source Control", hint: "View git changes" },
          ].map(({ label, hint }) => (
            <button
              key={label}
              className="text-left p-3 rounded-lg border border-border hover:bg-sidebar-accent transition-colors"
              data-testid={`welcome-${label.toLowerCase().replace(/\s+/g, "-")}`}
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
  const canRun = RUNNABLE_LANGS.has((activeTab.language || "").toLowerCase());

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* File path breadcrumb + Run button */}
      <div className="flex items-center gap-1 px-3 py-1 text-xs text-muted-foreground border-b border-border/50 bg-background shrink-0">
        <div className="flex-1 flex items-center gap-1 min-w-0 overflow-hidden">
          {activeTab.filePath.split("/").map((part, idx, arr) => (
            <span key={idx} className="flex items-center gap-1 shrink-0">
              {idx > 0 && <span className="text-border">/</span>}
              <span className={idx === arr.length - 1 ? "text-foreground" : ""}>{part}</span>
            </span>
          ))}
        </div>

        {canRun && (
          <button
            onClick={handleRun}
            disabled={running}
            title={`Run ${activeTab.fileName}`}
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors shrink-0 ml-2",
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

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <CodeEditor
          key={activeTab.fileId}
          fileId={activeTab.fileId}
          content={content}
          language={activeTab.language}
          onChange={(newContent) => updateFileContent(activeTab.fileId, newContent)}
        />
      </div>
    </div>
  );
}
