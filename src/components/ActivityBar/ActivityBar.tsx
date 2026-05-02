import { Files, Search, GitBranch, Package, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";

const ACTIVITY_ITEMS = [
  { id: "explorer" as const, icon: Files, label: "Explorer", shortcut: "⌘E" },
  { id: "search" as const, icon: Search, label: "Search", shortcut: "⌘⇧F" },
  { id: "git" as const, icon: GitBranch, label: "Source Control", shortcut: "⌃⇧G" },
  { id: "extensions" as const, icon: Package, label: "Extensions", shortcut: "⌘⇧X" },
];

export function ActivityBar() {
  const { activeSidePanel, setActiveSidePanel, sidebarVisible, toggleSidebar, problems } =
    useEditorStore();

  const errorCount = problems.filter((p) => p.severity === "error").length;
  const warningCount = problems.filter((p) => p.severity === "warning").length;

  return (
    <div
      className="flex flex-col items-center justify-between h-full bg-sidebar border-r border-sidebar-border"
      style={{ width: 48 }}
      data-testid="activity-bar"
    >
      <div className="flex flex-col items-center gap-0.5 pt-1">
        {ACTIVITY_ITEMS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            data-testid={`activity-${id}`}
            onClick={() => {
              if (activeSidePanel === id && sidebarVisible) {
                toggleSidebar();
              } else {
                setActiveSidePanel(id);
                if (!sidebarVisible) toggleSidebar();
              }
            }}
            title={label}
            className={cn(
              "relative flex items-center justify-center w-12 h-12 activity-icon transition-colors",
              activeSidePanel === id && sidebarVisible
                ? "text-sidebar-foreground after:absolute after:left-0 after:top-2 after:bottom-2 after:w-0.5 after:bg-primary"
                : "text-muted-foreground hover:text-sidebar-foreground"
            )}
          >
            <Icon size={22} />
            {id === "git" && (errorCount + warningCount > 0) && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-destructive text-[9px] text-white flex items-center justify-center font-bold">
                {errorCount + warningCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-0.5 pb-1">
        <button
          data-testid="activity-settings"
          onClick={() => {
            setActiveSidePanel("settings");
            if (!sidebarVisible) toggleSidebar();
          }}
          title="Settings (⌘,)"
          className={cn(
            "relative flex items-center justify-center w-12 h-12 activity-icon transition-colors",
            activeSidePanel === "settings" && sidebarVisible
              ? "text-sidebar-foreground after:absolute after:left-0 after:top-2 after:bottom-2 after:w-0.5 after:bg-primary"
              : "text-muted-foreground hover:text-sidebar-foreground"
          )}
        >
          <Settings size={22} />
        </button>
        <button
          data-testid="toggle-sidebar"
          onClick={toggleSidebar}
          title={sidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
          className="flex items-center justify-center w-12 h-12 text-muted-foreground hover:text-sidebar-foreground activity-icon transition-colors"
        >
          {sidebarVisible ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
    </div>
  );
}
