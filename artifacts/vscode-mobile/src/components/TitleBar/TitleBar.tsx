import { useState } from "react";
import { Save, Play, Loader2, TerminalSquare, Code2, LogOut, User, Cloud, CloudOff } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { AuthUser } from "@/hooks/useAuth";

const MENU_ITEMS = {
  File: [
    { label: "New File", shortcut: "⌘N" },
    { label: "New Folder", shortcut: "" },
    { label: "Save", shortcut: "⌘S" },
    { label: "Save All", shortcut: "⌘⇧S" },
    { type: "separator" },
    { label: "Auto Save", shortcut: "", toggle: "autoSave" },
    { type: "separator" },
    { label: "Download File", shortcut: "" },
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
    { label: "Preview", shortcut: "" },
    { type: "separator" },
    { label: "Toggle Sidebar", shortcut: "⌘B" },
    { label: "Toggle Theme", shortcut: "" },
  ],
  Run: [
    { label: "Run Code", shortcut: "⌘⏎" },
    { label: "Stop", shortcut: "⌘." },
  ],
};

interface TitleBarProps {
  authUser: AuthUser | null;
  onSignOut: () => Promise<void>;
}

export function TitleBar({ authUser, onSignOut }: TitleBarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const {
    saveCurrentFile, togglePanel, setActivePanel, panelVisible,
    toggleSidebar, setActiveSidePanel, autoSave, setAutoSave,
    setTheme, theme, openTabs, activeTabId, files,
    executeRun, isRunning,
  } = useEditorStore();

  const activeTab = openTabs.find((t) => t.id === activeTabId);

  const getFileContent = (fileId: string): string => {
    const findContent = (nodes: typeof files): string => {
      for (const node of nodes) {
        if (node.id === fileId) return node.content || "";
        if (node.children) {
          const found = findContent(node.children);
          if (found !== "") return found;
        }
      }
      return "";
    };
    return findContent(files);
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

  const handleRunCode = () => {
    if (!panelVisible) togglePanel();
    executeRun();
  };

  const handleMenuAction = (label: string) => {
    setOpenMenu(null);
    switch (label) {
      case "Save": saveCurrentFile(); break;
      case "Save All": openTabs.forEach(() => saveCurrentFile()); break;
      case "Auto Save": setAutoSave(!autoSave); break;
      case "Download File": handleDownload(); break;
      case "Terminal": setActivePanel("terminal"); if (!panelVisible) togglePanel(); break;
      case "Problems": setActivePanel("problems"); if (!panelVisible) togglePanel(); break;
      case "Preview": setActivePanel("preview" as never); if (!panelVisible) togglePanel(); break;
      case "Toggle Sidebar": toggleSidebar(); break;
      case "Toggle Theme": setTheme(theme === "dark" ? "light" : "dark"); break;
      case "Explorer": setActiveSidePanel("explorer"); break;
      case "Search": setActiveSidePanel("search"); break;
      case "Source Control": setActiveSidePanel("git"); break;
      case "Extensions": setActiveSidePanel("extensions"); break;
      case "Run Code": handleRunCode(); break;
    }
  };

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    setSigningOut(true);
    await onSignOut();
    setSigningOut(false);
  };

  const isSynced = Boolean(authUser) && isSupabaseConfigured;

  return (
    <div className="flex items-center h-11 sm:h-9 border-b border-border bg-sidebar shrink-0 select-none" data-testid="title-bar">
      {/* App icon */}
      <div className="flex items-center justify-center w-11 sm:w-12 h-full border-r border-sidebar-border shrink-0">
        <Code2 size={18} className="text-primary" />
      </div>

      {/* Menu bar — hidden on mobile */}
      <div className="hidden sm:flex items-center h-full">
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
                <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                <div className="absolute left-0 top-full z-50 bg-popover border border-popover-border rounded shadow-lg min-w-[200px]">
                  {(MENU_ITEMS as Record<string, Array<{ label?: string; shortcut?: string; type?: string; toggle?: string }>>)[menuName].map((item, idx) => {
                    if (item.type === "separator") return <div key={idx} className="h-px bg-border my-1" />;
                    const isToggled = item.toggle === "autoSave" ? autoSave : false;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleMenuAction(item.label!)}
                        className="flex items-center justify-between w-full px-3 py-2 text-sm sm:py-1.5 sm:text-xs hover:bg-sidebar-accent text-foreground"
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

      {/* Center — file name */}
      <div className="flex-1 flex items-center justify-center min-w-0 px-2">
        <span className="text-xs text-muted-foreground truncate max-w-full">
          {activeTab ? activeTab.fileName : "KM Code"}
        </span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-0 sm:gap-0.5 px-1 sm:px-2">
        <span className="hidden sm:block"><KeyboardShortcutsDialog /></span>

        <button
          onClick={saveCurrentFile}
          className="p-2.5 sm:p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          title="Save (⌘S)"
          data-testid="save-button"
        >
          <Save size={16} className="sm:w-[15px] sm:h-[15px]" />
        </button>

        <button
          onClick={handleRunCode}
          disabled={isRunning}
          className="p-2.5 sm:p-1.5 rounded text-muted-foreground hover:text-green-500 hover:bg-sidebar-accent transition-colors disabled:opacity-50"
          title="Run (⌘Enter)"
          data-testid="run-button"
        >
          {isRunning
            ? <Loader2 size={16} className="animate-spin text-green-500 sm:w-[15px] sm:h-[15px]" />
            : <Play size={16} className="sm:w-[15px] sm:h-[15px]" />}
        </button>

        <button
          onClick={() => { setActivePanel("terminal"); if (!panelVisible) togglePanel(); }}
          className="p-2.5 sm:p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          title="Terminal"
          data-testid="terminal-button"
        >
          <TerminalSquare size={16} className="sm:w-[15px] sm:h-[15px]" />
        </button>

        {/* User avatar / account menu */}
        <div className="relative ml-0.5">
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="relative flex items-center p-1.5 rounded hover:bg-sidebar-accent transition-colors"
            title={authUser ? (authUser.name ?? authUser.email ?? "Account") : "Guest"}
            data-testid="user-menu-button"
          >
            {authUser?.avatar ? (
              <img
                src={authUser.avatar}
                alt={authUser.name ?? "User"}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-primary/40"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <User size={13} className="text-muted-foreground" />
              </div>
            )}
            {/* Sync indicator */}
            <span
              className={cn(
                "absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full border-2 border-sidebar",
                isSynced ? "bg-green-500" : "bg-yellow-400"
              )}
            />
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-60 bg-popover border border-popover-border rounded-xl shadow-2xl overflow-hidden">
                {/* User info */}
                <div className="px-4 py-3 border-b border-border">
                  {authUser ? (
                    <>
                      <div className="text-sm font-medium text-foreground truncate">{authUser.name}</div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">{authUser.email}</div>
                      <div className="flex items-center gap-1.5 mt-2">
                        {isSynced ? (
                          <><Cloud size={11} className="text-green-500" /><span className="text-xs text-green-500">Synced to cloud</span></>
                        ) : (
                          <><CloudOff size={11} className="text-yellow-500" /><span className="text-xs text-yellow-500">Sync unavailable</span></>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-medium text-foreground">Guest Mode</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Files saved locally only</div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <CloudOff size={11} className="text-yellow-500" />
                        <span className="text-xs text-yellow-500">Not synced</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="py-1">
                  <button
                    onClick={() => { setUserMenuOpen(false); setTheme(theme === "dark" ? "light" : "dark"); }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-sidebar-accent text-foreground transition-colors"
                  >
                    Toggle {theme === "dark" ? "Light" : "Dark"} Theme
                  </button>
                  <button
                    onClick={() => { setUserMenuOpen(false); setActiveSidePanel("settings"); }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-sidebar-accent text-foreground transition-colors"
                  >
                    Settings
                  </button>
                </div>

                <div className="border-t border-border py-1">
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-sidebar-accent text-destructive transition-colors disabled:opacity-50"
                  >
                    {signingOut
                      ? <Loader2 size={14} className="animate-spin" />
                      : <LogOut size={14} />}
                    {authUser ? "Sign Out" : "Sign In / Switch Account"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
