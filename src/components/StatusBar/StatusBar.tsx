import { GitBranch, AlertCircle, AlertTriangle, CheckCircle, Bell, TerminalSquare, Sun, Moon, Download } from "lucide-react";
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
    files,
  } = useEditorStore();

  const activeTab = openTabs.find((t) => t.id === activeTabId);
  const errors = problems.filter((p) => p.severity === "error").length;
  const warnings = problems.filter((p) => p.severity === "warning").length;

  const getFileContent = (fileId: string): string => {
    const findContent = (nodes: typeof files): string | null => {
      for (const node of nodes) {
        if (node.id === fileId) return node.content ?? "";
        if (node.children) {
          const found = findContent(node.children);
          if (found !== null) return found;
        }
      }
      return null;
    };
    return findContent(files) ?? "";
  };

  const handleDownload = () => {
    if (!activeTab) return;
    const content = getFileContent(activeTab.fileId);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeTab.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="flex items-center justify-between px-2 text-white text-xs shrink-0 select-none"
      style={{
        backgroundColor: "hsl(var(--status-bar-bg))",
        height: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
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
            <span className="hidden sm:inline">Auto Save</span>
          </span>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {activeTab && (
          <>
            <span className="opacity-80 capitalize hidden sm:block">{activeTab.language}</span>
            <span className="opacity-80 hidden sm:block">Spaces: {tabSize}</span>
            <span className="opacity-80 hidden md:block">UTF-8</span>
            <button
              onClick={handleDownload}
              className="hover:bg-white/10 px-1 rounded transition-colors"
              title={`Download ${activeTab.fileName}`}
            >
              <Download size={12} />
            </button>
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
          className="hover:bg-white/10 px-1 rounded transition-colors flex items-center gap-1"
          title="Toggle Theme"
          data-testid="status-theme"
        >
          {theme === "dark" ? <Moon size={12} /> : <Sun size={12} />}
          <span className="hidden sm:inline capitalize">{theme}</span>
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
