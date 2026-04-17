import { useRef, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";

export function Terminal() {
  const { terminalLines, clearTerminal, executeCommand } = useEditorStore();
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLines]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setHistory((h) => [input, ...h]);
    setHistoryIdx(-1);
    executeCommand(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const newIdx = Math.min(historyIdx + 1, history.length - 1);
      setHistoryIdx(newIdx);
      if (history[newIdx]) setInput(history[newIdx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const newIdx = Math.max(historyIdx - 1, -1);
      setHistoryIdx(newIdx);
      setInput(newIdx === -1 ? "" : history[newIdx] || "");
    }
  };

  return (
    <div className="flex flex-col h-full" data-testid="terminal">
      <div className="flex items-center justify-between px-3 py-1 border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">TERMINAL</span>
          <span className="text-xs text-muted-foreground">bash</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearTerminal}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
            title="Clear Terminal"
            data-testid="clear-terminal"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto terminal-output p-2 bg-background cursor-text"
        onClick={() => inputRef.current?.focus()}
        data-testid="terminal-output"
      >
        {terminalLines.map((line) => (
          <div
            key={line.id}
            className={cn(
              "whitespace-pre-wrap break-all leading-relaxed",
              line.type === "input" && "text-primary font-medium",
              line.type === "output" && "text-foreground",
              line.type === "error" && "text-destructive",
              line.type === "info" && "text-muted-foreground italic"
            )}
          >
            {line.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-2 py-1.5 border-t border-border bg-background shrink-0"
      >
        <span className="text-primary font-mono text-sm shrink-0">$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type command..."
          className="flex-1 bg-transparent text-foreground font-mono text-sm focus:outline-none placeholder:text-muted-foreground"
          data-testid="terminal-input"
          autoComplete="off"
          spellCheck={false}
        />
      </form>
    </div>
  );
}
