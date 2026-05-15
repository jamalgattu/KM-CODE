import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search, File, Play, Terminal, Settings, Code2,
  Sun, Moon, ZoomIn, ZoomOut, WrapText, Maximize2, Minimize2,
  GitBranch, Bot, FileSearch, FolderOpen, Save, Hash, X,
  ChevronRight, ChevronsUpDown,
} from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { getCurrentEditorView } from "@/lib/editorView";
import { openSearchPanel } from "@codemirror/search";
import { foldAll, unfoldAll } from "@codemirror/language";
import { EDITOR_THEMES } from "@/lib/editorThemes";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  category: string;
  action: () => void;
  keywords?: string;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onGoToLine: () => void;
  onNewFile: () => void;
}

export function CommandPalette({ open, onClose, onGoToLine, onNewFile }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const {
    files, openFile, getAllFiles,
    saveCurrentFile, executeRun,
    toggleSidebar, setSidebarVisible, setActiveSidePanel,
    togglePanel, setActivePanel, panelVisible,
    toggleFullscreen, isFullscreen,
    setTheme, theme, fontSize, setFontSize, setWordWrap, wordWrap,
    openTabs, activeTabId,
  } = useEditorStore();

  const allFiles = useMemo(() => getAllFiles(), [files]);

  const commands = useMemo((): CommandItem[] => {
    const fileItems: CommandItem[] = allFiles.map((f) => ({
      id: `open-${f.id}`,
      label: f.name,
      description: f.path,
      icon: <File size={14} className="text-blue-400 shrink-0" />,
      category: "Open File",
      keywords: f.name + " " + f.path,
      action: () => { openFile(f.id); onClose(); },
    }));

    const staticCommands: CommandItem[] = [
      // Files
      {
        id: "new-file",
        label: "New File",
        description: "Create a new file with template",
        icon: <File size={14} className="text-green-400 shrink-0" />,
        category: "File",
        action: () => { onNewFile(); onClose(); },
      },
      {
        id: "save-file",
        label: "Save File",
        description: "Ctrl+S",
        icon: <Save size={14} className="text-foreground/60 shrink-0" />,
        category: "File",
        action: () => { saveCurrentFile(); onClose(); },
      },
      // Edit
      {
        id: "find-in-file",
        label: "Find in File",
        description: "Ctrl+F",
        icon: <Search size={14} className="text-yellow-400 shrink-0" />,
        category: "Edit",
        action: () => {
          const v = getCurrentEditorView();
          if (v) openSearchPanel(v);
          onClose();
        },
      },
      {
        id: "go-to-line",
        label: "Go to Line",
        description: "Ctrl+G",
        icon: <Hash size={14} className="text-foreground/60 shrink-0" />,
        category: "Edit",
        action: () => { onGoToLine(); onClose(); },
      },
      {
        id: "fold-all",
        label: "Fold All",
        description: "Collapse all code blocks",
        icon: <ChevronsUpDown size={14} className="text-foreground/60 shrink-0" />,
        category: "Edit",
        action: () => { const v = getCurrentEditorView(); if (v) foldAll(v); onClose(); },
      },
      {
        id: "unfold-all",
        label: "Unfold All",
        description: "Expand all code blocks",
        icon: <ChevronsUpDown size={14} className="text-foreground/60 shrink-0" />,
        category: "Edit",
        action: () => { const v = getCurrentEditorView(); if (v) unfoldAll(v); onClose(); },
      },
      // Run
      {
        id: "run-code",
        label: "Run Code",
        description: "Ctrl+Enter",
        icon: <Play size={14} className="text-green-400 shrink-0" />,
        category: "Run",
        action: () => { executeRun(); onClose(); },
      },
      // View
      {
        id: "toggle-sidebar",
        label: "Toggle Sidebar",
        description: "Ctrl+B",
        icon: <FolderOpen size={14} className="text-foreground/60 shrink-0" />,
        category: "View",
        action: () => { toggleSidebar(); onClose(); },
      },
      {
        id: "toggle-terminal",
        label: "Open Terminal",
        description: "Ctrl+`",
        icon: <Terminal size={14} className="text-green-400 shrink-0" />,
        category: "View",
        action: () => { setActivePanel("terminal"); if (!panelVisible) togglePanel(); onClose(); },
      },
      {
        id: "toggle-output",
        label: "Open Output",
        description: "View run results",
        icon: <FileSearch size={14} className="text-foreground/60 shrink-0" />,
        category: "View",
        action: () => { setActivePanel("output"); if (!panelVisible) togglePanel(); onClose(); },
      },
      {
        id: "toggle-ai",
        label: "Open AI Assistant",
        description: "Chat with AI about your code",
        icon: <Bot size={14} className="text-purple-400 shrink-0" />,
        category: "View",
        action: () => { setActivePanel("ai" as never); if (!panelVisible) togglePanel(); onClose(); },
      },
      {
        id: "explorer",
        label: "Explorer",
        description: "Show file explorer",
        icon: <FolderOpen size={14} className="text-yellow-400 shrink-0" />,
        category: "View",
        action: () => { setSidebarVisible(true); setActiveSidePanel("explorer"); onClose(); },
      },
      {
        id: "search-files",
        label: "Search in Files",
        description: "Ctrl+Shift+F",
        icon: <Search size={14} className="text-blue-400 shrink-0" />,
        category: "View",
        action: () => { setSidebarVisible(true); setActiveSidePanel("search"); onClose(); },
      },
      {
        id: "source-control",
        label: "Source Control",
        description: "Git status",
        icon: <GitBranch size={14} className="text-orange-400 shrink-0" />,
        category: "View",
        action: () => { setSidebarVisible(true); setActiveSidePanel("git"); onClose(); },
      },
      {
        id: "settings",
        label: "Settings",
        description: "Editor preferences",
        icon: <Settings size={14} className="text-foreground/60 shrink-0" />,
        category: "View",
        action: () => { setSidebarVisible(true); setActiveSidePanel("settings"); onClose(); },
      },
      {
        id: "toggle-fullscreen",
        label: isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen",
        description: "F11",
        icon: isFullscreen
          ? <Minimize2 size={14} className="text-foreground/60 shrink-0" />
          : <Maximize2 size={14} className="text-foreground/60 shrink-0" />,
        category: "View",
        action: () => { toggleFullscreen(); onClose(); },
      },
      {
        id: "word-wrap",
        label: wordWrap ? "Disable Word Wrap" : "Enable Word Wrap",
        description: "Wrap long lines",
        icon: <WrapText size={14} className="text-foreground/60 shrink-0" />,
        category: "View",
        action: () => { setWordWrap(!wordWrap); onClose(); },
      },
      {
        id: "zoom-in",
        label: "Zoom In",
        description: `Current: ${fontSize}px`,
        icon: <ZoomIn size={14} className="text-foreground/60 shrink-0" />,
        category: "View",
        action: () => { setFontSize(Math.min(fontSize + 2, 36)); onClose(); },
      },
      {
        id: "zoom-out",
        label: "Zoom Out",
        description: `Current: ${fontSize}px`,
        icon: <ZoomOut size={14} className="text-foreground/60 shrink-0" />,
        category: "View",
        action: () => { setFontSize(Math.max(fontSize - 2, 10)); onClose(); },
      },
      // Themes
      ...EDITOR_THEMES.map((t) => ({
        id: `theme-${t.id}`,
        label: `Theme: ${t.name}`,
        description: t.dark ? "Dark theme" : "Light theme",
        icon: t.dark
          ? <Moon size={14} className="text-indigo-400 shrink-0" />
          : <Sun size={14} className="text-yellow-400 shrink-0" />,
        category: "Theme",
        keywords: t.name + " theme color",
        action: () => { setTheme(t.id); onClose(); },
      })),
    ];

    return [...fileItems, ...staticCommands];
  }, [allFiles, panelVisible, isFullscreen, wordWrap, fontSize, theme, openFile, onClose]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands.slice(0, 40);
    const q = query.toLowerCase();
    return commands
      .filter((c) =>
        c.label.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.keywords ?? "").toLowerCase().includes(q)
      )
      .slice(0, 40);
  }, [commands, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => { setSelectedIdx(0); }, [query]);

  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.children[selectedIdx] as HTMLElement;
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIdx]);

  if (!open) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && filtered[selectedIdx]) { filtered[selectedIdx].action(); }
  };

  const grouped: Record<string, CommandItem[]> = {};
  for (const cmd of filtered) {
    if (!grouped[cmd.category]) grouped[cmd.category] = [];
    grouped[cmd.category].push(cmd);
  }

  let flatIdx = 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-3 sm:pt-[15vh]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-popover border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or file name..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-0.5 rounded text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
          <kbd className="hidden sm:flex items-center text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5">Esc</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
              <Code2 size={24} className="opacity-30" />
              <span className="text-sm">No commands found</span>
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 bg-muted/30 select-none">
                  {category}
                </div>
                {items.map((item) => {
                  const idx = flatIdx++;
                  const isSelected = idx === selectedIdx;
                  return (
                    <button
                      key={item.id}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 sm:py-2 text-left transition-colors",
                        isSelected
                          ? "bg-primary/15 text-foreground"
                          : "hover:bg-sidebar-accent text-foreground/80"
                      )}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIdx(idx)}
                    >
                      {item.icon}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">{item.label}</div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                        )}
                      </div>
                      {isSelected && <ChevronRight size={12} className="text-muted-foreground shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-border text-xs text-muted-foreground shrink-0 bg-muted/20 select-none">
          <span className="flex items-center gap-1"><kbd className="border border-border rounded px-1">↑↓</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="border border-border rounded px-1">↵</kbd> select</span>
          <span className="flex items-center gap-1"><kbd className="border border-border rounded px-1">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
