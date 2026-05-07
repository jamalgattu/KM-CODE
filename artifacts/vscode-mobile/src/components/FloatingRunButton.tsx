import { Play, Loader2, ArrowDownToLine } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { getLanguageFromPath } from "@/types/editor";
import { cn } from "@/lib/utils";

const RUNNABLE = new Set([
  "javascript", "typescript", "python", "python3", "bash", "sh", "shell",
  "java", "cpp", "c", "rust", "go", "php", "ruby", "swift",
]);

export function FloatingRunButton() {
  const { openTabs, activeTabId, isRunning, executeRun, panelVisible, togglePanel, setActivePanel, stdin } = useEditorStore();

  const activeTab = openTabs.find((t) => t.id === activeTabId);
  if (!activeTab) return null;

  const lang = (activeTab.language || getLanguageFromPath(activeTab.fileName)).toLowerCase();
  if (!RUNNABLE.has(lang)) return null;

  const hasStdin = stdin.trim().length > 0;

  const handleRun = () => {
    setActivePanel("output");
    if (!panelVisible) togglePanel();
    executeRun();
  };

  const handleInput = () => {
    setActivePanel("input");
    if (!panelVisible) togglePanel();
  };

  return (
    <>
      {/* Input FAB — sits above the Run FAB on mobile */}
      <button
        onTouchEnd={(e) => { e.preventDefault(); handleInput(); }}
        onClick={handleInput}
        aria-label="Open input panel"
        className={cn(
          "sm:hidden fixed right-4 z-50",
          "w-10 h-10 rounded-full shadow-lg",
          "flex items-center justify-center",
          "bg-blue-600 active:bg-blue-700",
          "transition-transform active:scale-95",
          "border-2",
          hasStdin ? "border-blue-400" : "border-blue-500/40",
        )}
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 9.5rem)" }}
      >
        <ArrowDownToLine size={17} className="text-white" />
        {hasStdin && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-background" />
        )}
      </button>

      {/* Run FAB */}
      <button
        onTouchEnd={(e) => { e.preventDefault(); handleRun(); }}
        onClick={handleRun}
        disabled={isRunning}
        aria-label="Run code"
        className={cn(
          "sm:hidden fixed right-4 z-50",
          "w-14 h-14 rounded-full shadow-xl",
          "flex items-center justify-center",
          "bg-green-500 active:bg-green-600",
          "transition-transform active:scale-95",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          "border-2 border-green-400/50",
        )}
        style={{ boxShadow: "0 4px 24px rgba(34,197,94,0.4)", bottom: "calc(env(safe-area-inset-bottom, 0px) + 5rem)" }}
      >
        {isRunning
          ? <Loader2 size={24} className="animate-spin text-white" />
          : <Play size={24} className="text-white translate-x-0.5" fill="white" />}
      </button>
    </>
  );
}
