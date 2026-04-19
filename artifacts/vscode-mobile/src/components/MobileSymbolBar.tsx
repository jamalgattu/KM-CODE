import { useIsMobile } from "@/hooks/use-mobile";
import { insertAtCursor } from "@/lib/editorView";

const SYMBOLS = [
  { label: "Tab", value: "\t" },
  { label: "{", value: "{" },
  { label: "}", value: "}" },
  { label: "[", value: "[" },
  { label: "]", value: "]" },
  { label: "(", value: "(" },
  { label: ")", value: ")" },
  { label: ";", value: ";" },
  { label: ":", value: ":" },
  { label: '"', value: '"' },
  { label: "'", value: "'" },
  { label: "`", value: "`" },
  { label: "=", value: "=" },
  { label: "=>", value: "=>" },
  { label: "->", value: "->" },
  { label: ".", value: "." },
  { label: ",", value: "," },
  { label: "&&", value: " && " },
  { label: "||", value: " || " },
  { label: "!", value: "!" },
  { label: "<", value: "<" },
  { label: ">", value: ">" },
  { label: "/", value: "/" },
  { label: "//", value: "//" },
  { label: "/*", value: "/* " },
  { label: "_", value: "_" },
  { label: "+", value: "+" },
  { label: "-", value: "-" },
  { label: "*", value: "*" },
  { label: "%", value: "%" },
  { label: "#", value: "#" },
  { label: "@", value: "@" },
  { label: "\\n", value: "\n" },
];

export function MobileSymbolBar() {
  const isMobile = useIsMobile();
  if (!isMobile) return null;

  return (
    <div
      className="flex items-center overflow-x-auto shrink-0 border-t border-border bg-sidebar"
      style={{ height: 38, scrollbarWidth: "none" }}
      data-testid="mobile-symbol-bar"
    >
      <style>{`.symbol-bar-scroll::-webkit-scrollbar { display: none; }`}</style>
      <div className="flex items-center gap-px px-1 symbol-bar-scroll">
        {SYMBOLS.map(({ label, value }) => (
          <button
            key={label}
            onMouseDown={(e) => {
              e.preventDefault();
              insertAtCursor(value);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              insertAtCursor(value);
            }}
            className="flex items-center justify-center shrink-0 px-2.5 h-7 rounded text-xs font-mono text-foreground bg-background border border-border hover:bg-sidebar-accent active:bg-primary/20 transition-colors select-none"
            style={{ minWidth: label.length > 2 ? 40 : 32 }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
