import { useRef, useCallback } from "react";
import { X, TerminalSquare, AlertTriangle, FileText, Globe } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { Terminal } from "./Terminal";
import { ProblemsPanel } from "./ProblemsPanel";
import { OutputPanel } from "./OutputPanel";
import { HTMLPreview } from "./HTMLPreview";
import { cn } from "@/lib/utils";

const PANEL_TABS = [
  { id: "terminal" as const, label: "Terminal", icon: TerminalSquare },
  { id: "problems" as const, label: "Problems", icon: AlertTriangle },
  { id: "output" as const, label: "Output", icon: FileText },
  { id: "preview" as const, label: "Preview", icon: Globe },
];

export function BottomPanel() {
  const { panelVisible, panelHeight, setPanelHeight, togglePanel, activePanel, setActivePanel, problems, openTabs, activeTabId } =
    useEditorStore();
  const dragRef = useRef<{ startY: number; startHeight: number } | null>(null);
  const errorCount = problems.filter((p) => p.severity === "error").length;
  const warnCount = problems.filter((p) => p.severity === "warning").length;

  const activeTab = openTabs.find((t) => t.id === activeTabId);
  const isHTMLFile = activeTab?.language === "html";

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragRef.current = { startY: e.clientY, startHeight: panelHeight };

      const handleMouseMove = (ev: MouseEvent) => {
        if (!dragRef.current) return;
        const delta = dragRef.current.startY - ev.clientY;
        const newHeight = Math.min(Math.max(dragRef.current.startHeight + delta, 100), 500);
        setPanelHeight(newHeight);
      };

      const handleMouseUp = () => {
        dragRef.current = null;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [panelHeight, setPanelHeight]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      dragRef.current = { startY: touch.clientY, startHeight: panelHeight };

      const handleTouchMove = (ev: TouchEvent) => {
        if (!dragRef.current) return;
        const delta = dragRef.current.startY - ev.touches[0].clientY;
        const newHeight = Math.min(Math.max(dragRef.current.startHeight + delta, 100), 500);
        setPanelHeight(newHeight);
      };

      const handleTouchEnd = () => {
        dragRef.current = null;
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };

      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
    },
    [panelHeight, setPanelHeight]
  );

  if (!panelVisible) return null;

  const visibleTabs = PANEL_TABS.filter((tab) => {
    if (tab.id === "preview") return isHTMLFile;
    return true;
  });

  return (
    <div
      className="flex flex-col border-t border-border bg-background"
      style={{ height: panelHeight }}
      data-testid="bottom-panel"
    >
      {/* Resize handle — taller on mobile for easier touch dragging */}
      <div
        className="panel-resize-handle h-2 sm:h-1 bg-border/50 hover:bg-primary/50 active:bg-primary/70 transition-colors shrink-0 touch-none cursor-row-resize flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        data-testid="panel-resize-handle"
      >
        <div className="sm:hidden w-8 h-0.5 rounded-full bg-border/80" />
      </div>

      {/* Panel tabs */}
      <div className="flex items-center border-b border-border shrink-0 bg-muted/30">
        {visibleTabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActivePanel(id as any)}
            className={cn(
              "flex items-center gap-1.5 px-3 h-8 text-xs cursor-pointer transition-colors relative",
              activePanel === id
                ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            data-testid={`panel-tab-${id}`}
          >
            <Icon size={13} />
            {label}
            {id === "problems" && (errorCount + warnCount) > 0 && (
              <span className="ml-0.5 text-xs text-destructive">
                {errorCount > 0 && `${errorCount}`}
                {errorCount > 0 && warnCount > 0 && "+"}
                {warnCount > 0 && `${warnCount}`}
              </span>
            )}
          </button>
        ))}
        <div className="ml-auto flex items-center pr-1">
          <button
            onClick={togglePanel}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
            title="Close Panel"
            data-testid="close-panel"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Panel content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activePanel === "terminal" && <Terminal />}
        {activePanel === "problems" && <ProblemsPanel />}
        {activePanel === "output" && <OutputPanel />}
        {(activePanel as string) === "preview" && <HTMLPreview />}
      </div>
    </div>
  );
}
