import { GitBranch, AlertCircle, AlertTriangle, CheckCircle, Loader, Bell, Settings, TerminalSquare } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";

export function StatusBar() {
  const {
    openTabs,
    activeTabId,
    gitBranch,
    problems,
    tabSize,
    theme,
    setTheme,
    setActivePanel,
    togglePanel,
    panelVisible,
    autoSave,
  } = useEditorStore();

  const activeTab = openTabs.find((t) => t.id === activeTabId);
  const errors = problems.filter((p) => p.severity === "error").length;
  const warnings = problems.filter((p) => p.severity === "warning").length;

  return (
    <div
      className="flex items-center justify-between h-6 px-2 text-white text-xs shrink-0"
      style={{ backgroundColor: "hsl(var(--status-bar-bg))" }}
      data-testid="status-bar"
    >
      {/* Left section */}
      <div className="flex items-center gap-3">
        <button
          className="flex items-center gap-1 hover:bg-white/10 px-1.5 rounded transition-colors"
          title="Source Control"
          data-testid="status-branch"
        >
          <GitBranch size={12} />
          <span>{gitBranch}</span>
        </button>

        <button
          onClick={() => {
            setActivePanel("problems");
            if (!panelVisible) togglePanel();
          }}
          className="flex items-center gap-2 hover:bg-white/10 px-1.5 rounded transition-colors"
          data-testid="status-problems"
        >
          <span className="flex items-center gap-0.5">
            <AlertCircle size={12} />
            <span>{errors}</span>
          </span>
          <span className="flex items-center gap-0.5">
            <AlertTriangle size={12} />
            <span>{warnings}</span>
          </span>
        </button>

        {autoSave && (
          <span className="flex items-center gap-0.5 opacity-70 text-[10px]">
            <CheckCircle size={11} />
            Auto Save
          </span>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {activeTab && (
          <>
            <span className="opacity-80">{activeTab.language}</span>
            <span className="opacity-80">Spaces: {tabSize}</span>
            <span className="opacity-80">UTF-8</span>
          </>
        )}

        <button
          onClick={() => {
            setActivePanel("terminal");
            if (!panelVisible) togglePanel();
          }}
          className="hover:bg-white/10 px-1 rounded transition-colors"
          title="Toggle Terminal"
          data-testid="status-terminal"
        >
          <TerminalSquare size={12} />
        </button>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="hover:bg-white/10 px-1 rounded transition-colors capitalize"
          title="Toggle Theme"
          data-testid="status-theme"
        >
          {theme}
        </button>

        <button
          className="hover:bg-white/10 px-1 rounded transition-colors"
          title="Notifications"
          data-testid="status-notifications"
        >
          <Bell size={12} />
        </button>
      </div>
    </div>
  );
}
