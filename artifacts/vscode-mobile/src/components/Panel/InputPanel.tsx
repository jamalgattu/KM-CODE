import { useRef } from "react";
import { Keyboard, Trash2 } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";

export function InputPanel() {
  const { stdin, setStdin } = useEditorStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lineCount = stdin ? stdin.split("\n").length : 0;
  const charCount = stdin.length;

  return (
    <div className="flex flex-col h-full bg-background" data-testid="input-panel">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-1 border-b border-border bg-background shrink-0">
        <Keyboard size={13} className="text-blue-400" />
        <span className="text-xs font-semibold text-muted-foreground tracking-widest">STDIN</span>
        <span className="text-[10px] text-muted-foreground/60 ml-1">
          Program input — one value per line
        </span>
        <div className="ml-auto flex items-center gap-2">
          {stdin && (
            <span className="text-[10px] text-muted-foreground font-mono">
              {lineCount} line{lineCount !== 1 ? "s" : ""} · {charCount} chars
            </span>
          )}
          <button
            onClick={() => setStdin("")}
            disabled={!stdin}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent disabled:opacity-30"
            title="Clear input"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Textarea */}
      <div className="flex-1 min-h-0 relative">
        <textarea
          ref={textareaRef}
          value={stdin}
          onChange={(e) => setStdin(e.target.value)}
          placeholder={"Enter program input here...\n\nExample:\nJamal\n17\n\nEach line = one input() call in Python,\none Scanner.nextLine() call in Java, etc."}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className="absolute inset-0 w-full h-full resize-none bg-transparent font-mono text-xs text-foreground placeholder:text-muted-foreground/40 p-3 outline-none border-none focus:ring-0 panel-scroll"
        />
      </div>

      {/* Footer hint */}
      <div className="shrink-0 px-3 py-1.5 border-t border-border bg-muted/20">
        <p className="text-[10px] text-muted-foreground/50">
          Input is sent to your program on <kbd className="px-1 py-0.5 rounded bg-muted text-[10px]">Run</kbd> — works with <code className="text-[10px]">input()</code>, <code className="text-[10px]">scanf</code>, <code className="text-[10px]">Scanner</code>, <code className="text-[10px]">cin</code>, etc.
        </p>
      </div>
    </div>
  );
}
