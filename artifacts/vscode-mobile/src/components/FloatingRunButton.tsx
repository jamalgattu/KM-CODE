import { Play, Loader2 } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { getLanguageFromPath } from "@/types/editor";
import { cn } from "@/lib/utils";

const RUNNABLE = new Set([
  "javascript", "typescript", "python", "python3", "bash", "sh", "shell",
  "java", "cpp", "c", "rust", "go", "php", "ruby", "swift",
]);

export function FloatingRunButton() {
  const { openTabs, activeTabId, isRunning, executeRun, panelVisible, togglePanel, setActivePanel } = useEditorStore();

  const activeTab = openTabs.find((t) => t.id === activeTabId);
  if (!activeTab) return null;

  const lang = (activeTab.language || getLanguageFromPath(activeTab.fileName)).toLowerCase();
  if (!RUNNABLE.has(lang)) return null;

  const handleTap = () => {
    setActivePanel("output");
    if (!panelVisible) togglePanel();
    executeRun();
  };

  return (
    <button
      onTouchEnd={(e) => { e.preventDefault(); handleTap(); }}
      onClick={handleTap}
      disabled={isRunning}
      aria-label="Run code"
      className={cn(
        "sm:hidden fixed bottom-8 right-4 z-50",
        "w-14 h-14 rounded-full shadow-xl",
        "flex items-center justify-center",
        "bg-green-500 active:bg-green-600",
        "transition-transform active:scale-95",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        "border-2 border-green-400/50",
      )}
      style={{ boxShadow: "0 4px 24px rgba(34,197,94,0.4)" }}
    >
      {isRunning
        ? <Loader2 size={24} className="animate-spin text-white" />
        : <Play size={24} className="text-white translate-x-0.5" fill="white" />}
    </button>
  );
}
