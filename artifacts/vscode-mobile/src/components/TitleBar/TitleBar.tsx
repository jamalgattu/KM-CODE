import { useState } from "react";
import { Save, Play, TerminalSquare, Code2, Loader2 } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";

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

export function TitleBar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const {
    saveCurrentFile, togglePanel, setActivePanel, panelVisible,
    toggleSidebar, setActiveSidePanel, autoSave, setAutoSave,
    setTheme, theme, openTabs, activeTabId, executeCommand, files,
    addTerminalLine,
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

  const handleRunCode = async () => {
  if (!activeTab) {
    alert("No file open! Create a file first.");
    return;
  }

  const content = getFileContent(activeTab.fileId);
  if (!content.trim()) {
    alert("File is empty!");
    return;
  }

  const lang = activeTab.language ?? "javascript";

  const LANGUAGE_MAP: Record<string, { language: string; version: string; filename: string }> = {
    javascript: { language: "javascript", version: "18.15.0", filename: "index.js"   },
    typescript: { language: "typescript", version: "5.0.3",   filename: "index.ts"   },
    python:     { language: "python",     version: "3.10.0",  filename: "main.py"    },
    java:       { language: "java",       version: "15.0.2",  filename: "Main.java"  },
    cpp:        { language: "c++",        version: "10.2.0",  filename: "main.cpp"   },
    c:          { language: "c",          version: "10.2.0",  filename: "main.c"     },
    rust:       { language: "rust",       version: "1.50.0",  filename: "main.rs"    },
    bash:       { language: "bash",       version: "5.2.0",   filename: "script.sh"  },
    php:        { language: "php",        version: "8.2.3",   filename: "index.php"  },
    go:         { language: "go",         version: "1.16.2",  filename: "main.go"    },
    ruby:       { language: "ruby",       version: "3.0.1",   filename: "main.rb"    },
    swift:      { language: "swift",      version: "5.3.3",   filename: "main.swift" },
  };

  const runtime = LANGUAGE_MAP[lang];
  if (!runtime) {
    alert(`Language "${lang}" not supported yet.\nSupported: ${Object.keys(LANGUAGE_MAP).join(", ")}`);
    return;
  }

  setRunning(true);

  try {
    const res = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: runtime.language,
        version: runtime.version,
        files: [{ name: runtime.filename, content }],
        run_timeout: 10000,
        compile_timeout: 10000,
      }),
    });

    const data = await res.json();
    const run = data.run ?? {};
    const compile = data.compile ?? {};

    let output = "";

    if (compile.stderr) {
      output = "❌ Compile Error:\n" + compile.stderr;
    } else {
      if (run.stdout) output += run.stdout;
      if (run.stderr) output += "\n❌ Error:\n" + run.stderr;
      if (!output.trim()) output = "✅ Code ran successfully (no output)";
    }

    alert(`▶ Output (${activeTab.fileName}):\n\n${output}`);

  } catch (err: any) {
    alert("Failed to run code: " + err.message);
  } finally {
    setRunning(false);
  }
};

  const handleMenuAction = (label: string) => {
    setOpenMenu(null);
    switch (label) {
      case "Save": saveCurrentFile(); break;
      case "Save All": openTabs.forEach(() => saveCurrentFile()); break;
      case "Auto Save": setAutoSave(!autoSave); break;
      case "Download File": handleDownload(); break;
      case "Terminal":
        setActivePanel("terminal");
        if (!panelVisible) togglePanel();
        break;
      case "Problems":
        setActivePanel("problems");
        if (!panelVisible) togglePanel();
        break;
      case "Preview":
        setActivePanel("preview" as any);
        if (!panelVisible) togglePanel();
        break;
      case "Toggle Sidebar": toggleSidebar(); break;
      case "Toggle Theme": setTheme(theme === "dark" ? "light" : "dark"); break;
      case "Explorer": setActiveSidePanel("explorer"); break;
      case "Search": setActiveSidePanel("search"); break;
      case "Source Control": setActiveSidePanel("git"); break;
      case "Extensions": setActiveSidePanel("extensions"); break;
      case "Run Code":
        handleRunCode();
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
                <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
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
          {activeTab ? activeTab.fileName : "KM Code Editor"}
        </span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-0.5 px-2">
        <KeyboardShortcutsDialog />
        <button
          onClick={saveCurrentFile}
          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          title="Save (⌘S)"
          data-testid="save-button"
        >
          <Save size={15} />
        </button>
        <button
          onClick={handleRunCode}
          className="p-1.5 rounded text-muted-foreground hover:text-green-500 hover:bg-sidebar-accent transition-colors"
          title="Run (⌘Enter)"
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
