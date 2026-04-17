import { useState } from "react";
import { Save, Play, TerminalSquare, RotateCcw, Menu, Code2, Keyboard, ChevronDown } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";

const MENU_ITEMS = {
  File: [
    { label: "New File", shortcut: "⌘N" },
    { label: "New Folder", shortcut: "" },
    { label: "Save", shortcut: "⌘S" },
    { label: "Save All", shortcut: "⌘⇧S" },
    { type: "separator" },
    { label: "Auto Save", shortcut: "", toggle: "autoSave" },
  ],
  Edit: [
    { label: "Undo", shortcut: "⌘Z" },
    { label: "Redo", shortcut: "⌘⇧Z" },
    { type: "separator" },
    { label: "Find", shortcut: "⌘F" },
    { label: "Replace", shortcut: "⌘H" },
    { type: "separator" },
    { label: "Select All", shortcut: "⌘A" },
  ],
  View: [
    { label: "Explorer", shortcut: "⌘⇧E" },
    { label: "Search", shortcut: "⌘⇧F" },
    { label: "Source Control", shortcut: "⌃⇧G" },
    { label: "Extensions", shortcut: "⌘⇧X" },
    { type: "separator" },
    { label: "Terminal", shortcut: "⌃`" },
    { label: "Problems", shortcut: "⌘⇧M" },
    { type: "separator" },
    { label: "Toggle Sidebar", shortcut: "⌘B" },
    { label: "Toggle Theme", shortcut: "" },
  ],
  Run: [
    { label: "Run Code", shortcut: "⌘⏎" },
    { label: "Stop", shortcut: "⌘." },
    { type: "separator" },
    { label: "Add Configuration", shortcut: "" },
  ],
};

export function TitleBar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const {
    saveCurrentFile, togglePanel, setActivePanel, panelVisible,
    toggleSidebar, setActiveSidePanel, autoSave, setAutoSave,
    setTheme, theme, openTabs, activeTabId, executeCommand,
  } = useEditorStore();

  const activeTab = openTabs.find((t) => t.id === activeTabId);

  const handleMenuAction = (label: string) => {
    setOpenMenu(null);
    switch (label) {
      case "Save": saveCurrentFile(); break;
      case "Save All": openTabs.forEach(() => saveCurrentFile()); break;
      case "Auto Save": setAutoSave(!autoSave); break;
      case "Terminal":
        setActivePanel("terminal");
        if (!panelVisible) togglePanel();
        break;
      case "Problems":
        setActivePanel("problems");
        if (!panelVisible) togglePanel();
        break;
      case "Toggle Sidebar": toggleSidebar(); break;
      case "Toggle Theme": setTheme(theme === "dark" ? "light" : "dark"); break;
      case "Explorer": setActiveSidePanel("explorer"); break;
      case "Search": setActiveSidePanel("search"); break;
      case "Source Control": setActiveSidePanel("git"); break;
      case "Extensions": setActiveSidePanel("extensions"); break;
      case "Run Code":
        setActivePanel("terminal");
        if (!panelVisible) togglePanel();
        if (activeTab) executeCommand(`node ${activeTab.fileName}`);
        break;
    }
  };

  return (
    <div className="flex items-center h-9 border-b border-border bg-sidebar shrink-0 select-none" data-testid="title-bar">
      {/* App icon */}
      <div className="flex items-center justify-center w-12 h-full border-r border-sidebar-border">
        <Code2 size={18} className="text-primary" />
      </div>

      {/* Menu bar */}
      <div className="flex items-center h-full">
        {Object.keys(MENU_ITEMS).map((menuName) => (
          <div key={menuName} className="relative h-full">
            <button
              onClick={() => setOpenMenu(openMenu === menuName ? null : menuName)}
              className={cn(
                "flex items-center gap-0.5 px-2 h-full text-xs transition-colors",
                openMenu === menuName
                  ? "bg-primary/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
              )}
              data-testid={`menu-${menuName.toLowerCase()}`}
            >
              {menuName}
            </button>
            {openMenu === menuName && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setOpenMenu(null)}
                />
                <div className="absolute left-0 top-full z-50 bg-popover border border-popover-border rounded shadow-lg min-w-[200px]">
                  {(MENU_ITEMS as Record<string, Array<{ label?: string; shortcut?: string; type?: string; toggle?: string }>>)[menuName].map((item, idx) => {
                    if (item.type === "separator") {
                      return <div key={idx} className="h-px bg-border my-1" />;
                    }
                    const isToggled = item.toggle === "autoSave" ? autoSave : false;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleMenuAction(item.label!)}
                        className="flex items-center justify-between w-full px-3 py-1.5 text-xs hover:bg-sidebar-accent text-foreground"
                        data-testid={`menu-item-${item.label?.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <span className="flex items-center gap-2">
                          {item.toggle && (
                            <span className={`w-2 h-2 rounded-full ${isToggled ? "bg-primary" : "border border-muted-foreground"}`} />
                          )}
                          {item.label}
                        </span>
                        {item.shortcut && (
                          <span className="text-muted-foreground ml-8">{item.shortcut}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Center - File name */}
      <div className="flex-1 flex items-center justify-center">
        <span className="text-xs text-muted-foreground">
          {activeTab ? activeTab.fileName : "Code Editor"}
        </span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-0.5 px-2">
        <button
          onClick={saveCurrentFile}
          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          title="Save (⌘S)"
          data-testid="save-button"
        >
          <Save size={15} />
        </button>
        <button
          onClick={() => {
            setActivePanel("terminal");
            if (!panelVisible) togglePanel();
            if (activeTab) executeCommand(`node ${activeTab.fileName}`);
          }}
          className="p-1.5 rounded text-muted-foreground hover:text-green-500 hover:bg-sidebar-accent transition-colors"
          title="Run"
          data-testid="run-button"
        >
          <Play size={15} />
        </button>
        <button
          onClick={() => {
            setActivePanel("terminal");
            if (!panelVisible) togglePanel();
          }}
          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          title="Terminal (⌃`)"
          data-testid="terminal-button"
        >
          <TerminalSquare size={15} />
        </button>
      </div>
    </div>
  );
}
