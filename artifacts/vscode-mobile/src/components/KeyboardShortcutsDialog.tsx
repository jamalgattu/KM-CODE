import { useState } from "react";
import { Keyboard, X } from "lucide-react";

const SHORTCUTS = [
  { category: "File", items: [
    { keys: ["Ctrl", "S"], label: "Save file" },
    { keys: ["Ctrl", "Shift", "S"], label: "Save all files" },
    { keys: ["Ctrl", "N"], label: "New file" },
  ]},
  { category: "View", items: [
    { keys: ["Ctrl", "B"], label: "Toggle sidebar" },
    { keys: ["Ctrl", "`"], label: "Toggle terminal" },
    { keys: ["Ctrl", "Shift", "E"], label: "Show explorer" },
    { keys: ["Ctrl", "Shift", "F"], label: "Show search" },
    { keys: ["Ctrl", "Shift", "M"], label: "Show problems" },
  ]},
  { category: "Run", items: [
    { keys: ["Ctrl", "Enter"], label: "Run current file" },
  ]},
  { category: "Editor", items: [
    { keys: ["Tab"], label: "Indent line" },
    { keys: ["Ctrl", "F"], label: "Find in file" },
    { keys: ["Ctrl", "H"], label: "Find & replace" },
    { keys: ["Ctrl", "A"], label: "Select all" },
    { keys: ["Ctrl", "Z"], label: "Undo" },
    { keys: ["Ctrl", "Shift", "Z"], label: "Redo" },
    { keys: ["Ctrl", "/"], label: "Toggle comment" },
    { keys: ["Alt", "↑"], label: "Move line up" },
    { keys: ["Alt", "↓"], label: "Move line down" },
  ]},
  { category: "Terminal", items: [
    { keys: ["run"], label: "Execute current file" },
    { keys: ["clear"], label: "Clear terminal" },
    { keys: ["help"], label: "Show help" },
    { keys: ["ls"], label: "List files" },
    { keys: ["↑", "↓"], label: "Command history" },
  ]},
];

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
        title="Keyboard Shortcuts"
        data-testid="shortcuts-button"
      >
        <Keyboard size={15} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-popover border border-popover-border rounded-lg shadow-2xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <Keyboard size={16} className="text-primary" />
                <span className="text-sm font-semibold text-foreground">Keyboard Shortcuts</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {SHORTCUTS.map(({ category, items }) => (
                <div key={category}>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                    {category}
                  </div>
                  <div className="space-y-1">
                    {items.map(({ keys, label }) => (
                      <div key={label} className="flex items-center justify-between py-1">
                        <span className="text-sm text-foreground">{label}</span>
                        <div className="flex items-center gap-1">
                          {keys.map((key, i) => (
                            <span key={i} className="flex items-center gap-1">
                              <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs font-mono text-foreground">
                                {key}
                              </kbd>
                              {i < keys.length - 1 && (
                                <span className="text-muted-foreground text-xs">+</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-2 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  On Mac, use <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-xs font-mono">⌘</kbd> instead of <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-xs font-mono">Ctrl</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
