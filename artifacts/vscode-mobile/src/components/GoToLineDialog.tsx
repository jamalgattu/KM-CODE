import { useState, useRef, useEffect } from "react";
import { Navigation, X } from "lucide-react";
import { getCurrentEditorView } from "@/lib/editorView";

interface GoToLineDialogProps {
  open: boolean;
  onClose: () => void;
  totalLines: number;
}

export function GoToLineDialog({ open, onClose, totalLines }: GoToLineDialogProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue("");
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const handleGo = () => {
    const line = parseInt(value, 10);
    if (isNaN(line) || line < 1) return;
    const view = getCurrentEditorView();
    if (!view) return;
    const clampedLine = Math.min(line, view.state.doc.lines);
    const pos = view.state.doc.line(clampedLine).from;
    view.dispatch({
      selection: { anchor: pos },
      scrollIntoView: true,
    });
    view.focus();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleGo();
    if (e.key === "Escape") onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-popover border border-popover-border rounded-lg shadow-2xl w-full max-w-xs">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
          <Navigation size={14} className="text-primary shrink-0" />
          <span className="text-xs font-semibold text-foreground flex-1">Go to Line</span>
          <span className="text-[10px] text-muted-foreground">1 – {totalLines}</span>
          <button onClick={onClose} className="p-0.5 rounded text-muted-foreground hover:text-foreground">
            <X size={13} />
          </button>
        </div>
        <div className="p-3 flex gap-2">
          <input
            ref={inputRef}
            type="number"
            min={1}
            max={totalLines}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Line number..."
            className="flex-1 bg-input border border-border rounded px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleGo}
            disabled={!value.trim()}
            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
          >
            Go
          </button>
        </div>
      </div>
    </div>
  );
}
