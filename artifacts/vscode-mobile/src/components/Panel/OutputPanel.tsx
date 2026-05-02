import { useRef, useEffect } from "react";
import { Trash2, Play, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";

const LANG_COLORS: Record<string, string> = {
  javascript: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  typescript: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  python:     "bg-blue-600/20 text-blue-300 border-blue-600/30",
  java:       "bg-orange-500/20 text-orange-400 border-orange-500/30",
  cpp:        "bg-purple-500/20 text-purple-400 border-purple-500/30",
  c:          "bg-purple-500/20 text-purple-400 border-purple-500/30",
  rust:       "bg-orange-600/20 text-orange-300 border-orange-600/30",
  go:         "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  php:        "bg-violet-500/20 text-violet-400 border-violet-500/30",
  ruby:       "bg-red-500/20 text-red-400 border-red-500/30",
  swift:      "bg-orange-400/20 text-orange-300 border-orange-400/30",
  bash:       "bg-green-500/20 text-green-400 border-green-500/30",
};

export function OutputPanel() {
  const { outputLines, outputMeta, clearOutput, executeRun, isRunning, openTabs, activeTabId } = useEditorStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeTab = openTabs.find((t) => t.id === activeTabId);
  const lang = (activeTab?.language || "").toLowerCase();
  const langColor = LANG_COLORS[lang] || "bg-muted text-muted-foreground border-border";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [outputLines]);

  const hasOutput = outputLines.length > 0;
  const meta = outputMeta;

  return (
    <div className="flex flex-col h-full bg-background" data-testid="output-panel">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-1 border-b border-border bg-background shrink-0">
        <span className="text-xs font-semibold text-muted-foreground tracking-widest">OUTPUT</span>

        {activeTab && (
          <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded border", langColor)}>
            {lang || "plain"}
          </span>
        )}

        {meta && (
          <div className="flex items-center gap-2 ml-1">
            {meta.exitCode === 0 ? (
              <span className="flex items-center gap-1 text-[11px] text-green-400">
                <CheckCircle size={11} /> OK
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-red-400">
                <XCircle size={11} /> Exit {meta.exitCode}
              </span>
            )}
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock size={10} />
              {meta.durationMs}ms
            </span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-1">
          {activeTab && (
            <button
              onClick={() => executeRun()}
              disabled={isRunning}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-green-400 hover:bg-green-500/10 border border-green-500/20 transition-colors disabled:opacity-50"
              title="Run file"
            >
              {isRunning ? <Loader2 size={11} className="animate-spin" /> : <Play size={11} />}
              {isRunning ? "Running..." : "Run"}
            </button>
          )}
          <button
            onClick={clearOutput}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
            title="Clear Output"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Output content */}
      <div className="flex-1 min-h-0 overflow-y-auto panel-scroll terminal-output p-3 font-mono text-sm" data-testid="output-content">
        {!hasOutput ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground select-none">
            <Play size={28} className="opacity-20" />
            <div className="text-center">
              <div className="text-sm font-medium text-foreground/40">No output yet</div>
              <div className="text-xs text-muted-foreground/60 mt-1">
                Click Run or press Ctrl+Enter to execute
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-0.5">
            {outputLines.map((line) => (
              <div
                key={line.id}
                className={cn(
                  "whitespace-pre-wrap break-all leading-relaxed text-xs",
                  line.type === "stdout"  && "text-foreground",
                  line.type === "stderr"  && "text-red-400",
                  line.type === "system"  && "text-muted-foreground italic",
                  line.type === "success" && "text-green-400 font-medium",
                  line.type === "failure" && "text-red-400 font-medium",
                )}
              >
                {line.type === "stderr" && (
                  <span className="text-red-500 mr-1 text-[10px] font-bold">ERR</span>
                )}
                {line.content}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
}
