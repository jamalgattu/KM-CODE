import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EditorState, FileNode, Tab, TerminalLine, OutputLine, OutputMeta, SearchResult, Problem, getLanguageFromPath } from "@/types/editor";
import { getCurrentEditorView } from "@/lib/editorView";

const DEFAULT_FILES: FileNode[] = [
  {
    id: "welcome-file",
    name: "welcome.md",
    type: "file",
    path: "/welcome.md",
    language: "markdown",
    content: `# Welcome to KM Code! ⚡

A free mobile-first code editor for everyone.

## Getting Started
1. Click the **+** button to create a new file (with starter templates!)
2. Select a language and start coding
3. Hit the **Run** button or type \`run\` in the terminal to execute your code
4. Sign in with Google to save files to cloud

## Supported Languages
JavaScript, TypeScript, Python, Java, C++, C, Rust, Go, PHP, Ruby, Swift, Bash

## New Features
- **Templates** — create files with pre-filled starter code
- **HTML Preview** — live preview for HTML files in the Preview panel
- **Mobile Symbol Bar** — quick-insert coding symbols on mobile
- **Download** — save any file to your device
- **Keyboard Shortcuts** — click the keyboard icon in the toolbar
- **Copy Code** — copy entire file to clipboard

## Keyboard Shortcuts
- \`Ctrl+S\` → Save file
- \`Ctrl+Enter\` → Run current file
- \`Ctrl+B\` → Toggle sidebar
- \`Ctrl+\`\` → Open terminal
- \`Ctrl+Shift+E\` → Explorer
- \`Ctrl+Shift+F\` → Search

## Terminal Commands
- \`run\` → execute current file
- \`clear\` → clear terminal
- \`help\` → show help
- \`ls\` → list files

Happy coding! 🚀
`,
  },
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

interface EditorStore extends EditorState {
  terminalLines: TerminalLine[];
  outputLines: OutputLine[];
  outputMeta: OutputMeta | null;
  isRunning: boolean;

  addFile: (parentId: string, name: string, type: "file" | "folder") => string;
  deleteFile: (fileId: string) => void;
  renameFile: (fileId: string, newName: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  toggleFolder: (folderId: string) => void;
  getFileById: (fileId: string) => FileNode | null;
  getAllFiles: () => FileNode[];

  openFile: (fileId: string) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  pinTab: (tabId: string) => void;
  closeOtherTabs: (tabId: string) => void;
  closeTabsToRight: (tabId: string) => void;

  setTheme: (theme: "dark" | "light") => void;
  setFontSize: (size: number) => void;
  setTabSize: (size: number) => void;
  setWordWrap: (wrap: boolean) => void;
  setMinimap: (show: boolean) => void;
  setLineNumbers: (show: boolean) => void;
  setAutoSave: (autoSave: boolean) => void;
  setFontFamily: (font: string) => void;

  toggleSidebar: () => void;
  setSidebarVisible: (visible: boolean) => void;
  togglePanel: () => void;
  setPanelHeight: (height: number) => void;
  setActivePanel: (panel: EditorState["activePanel"]) => void;
  setActiveSidePanel: (panel: EditorState["activeSidePanel"]) => void;

  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchResult[]) => void;
  searchInFiles: (query: string) => void;

  addTerminalLine: (line: Omit<TerminalLine, "id" | "timestamp">) => void;
  clearTerminal: () => void;
  executeCommand: (command: string) => void;

  addOutputLine: (line: Omit<OutputLine, "id" | "timestamp">) => void;
  clearOutput: () => void;
  executeRun: () => void;

  setProblems: (problems: Problem[]) => void;
  addProblem: (problem: Omit<Problem, "id">) => void;

  saveCurrentFile: () => void;
  setFilesFromApi: (files: FileNode[]) => void;
}

function findFileById(nodes: FileNode[], id: string): FileNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findFileById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

function getAllFilesFlat(nodes: FileNode[]): FileNode[] {
  const files: FileNode[] = [];
  for (const node of nodes) {
    if (node.type === "file") files.push(node);
    if (node.children) files.push(...getAllFilesFlat(node.children));
  }
  return files;
}

function findParentAndRemove(nodes: FileNode[], id: string): boolean {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) {
      nodes.splice(i, 1);
      return true;
    }
    if (nodes[i].children && findParentAndRemove(nodes[i].children!, id)) {
      return true;
    }
  }
  return false;
}

const PISTON_URL = "https://emkc.org/api/v2/piston";
const LANGUAGE_RUNTIME: Record<string, { language: string; version: string; filename: string }> = {
  javascript: { language: "javascript", version: "18.15.0", filename: "index.js"   },
  typescript: { language: "typescript", version: "5.0.3",   filename: "index.ts"   },
  python:     { language: "python",     version: "3.10.0",  filename: "main.py"    },
  java:       { language: "java",       version: "15.0.2",  filename: "Main.java"  },
  cpp:        { language: "c++",        version: "10.2.0",  filename: "main.cpp"   },
  c:          { language: "c",          version: "10.2.0",  filename: "main.c"     },
  rust:       { language: "rust",       version: "1.50.0",  filename: "main.rs"    },
  bash:       { language: "bash",       version: "5.2.0",   filename: "script.sh"  },
  sh:         { language: "bash",       version: "5.2.0",   filename: "script.sh"  },
  shell:      { language: "bash",       version: "5.2.0",   filename: "script.sh"  },
  php:        { language: "php",        version: "8.2.3",   filename: "index.php"  },
  go:         { language: "go",         version: "1.16.2",  filename: "main.go"    },
  ruby:       { language: "ruby",       version: "3.0.1",   filename: "main.rb"    },
  swift:      { language: "swift",      version: "5.3.3",   filename: "main.swift" },
};

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      files: DEFAULT_FILES,
      openTabs: [],
      activeTabId: null,
      theme: "dark",
      fontSize: 14,
      tabSize: 2,
      wordWrap: false,
      minimap: false,
      lineNumbers: true,
      autoSave: true,
      fontFamily: "JetBrains Mono",
      sidebarVisible: true,
      panelVisible: false,
      panelHeight: typeof window !== "undefined" && window.innerWidth < 640 ? 280 : 220,
      activePanel: "terminal",
      activeSidePanel: "explorer",
      searchQuery: "",
      searchResults: [],
      gitBranch: "main",
      problems: [],
      terminalLines: [
        {
          id: "welcome",
          type: "info",
          content: "⚡ KM Code Terminal — type 'help' for commands.",
          timestamp: Date.now(),
        },
      ],
      outputLines: [],
      outputMeta: null,
      isRunning: false,

      getFileById: (fileId) => findFileById(get().files, fileId),
      getAllFiles: () => getAllFilesFlat(get().files),

      addFile: (parentId, name, type) => {
        const id = generateId();
        set((state) => {
          const files = JSON.parse(JSON.stringify(state.files)) as FileNode[];
          const parent = findFileById(files, parentId);
          if (parent && parent.type === "folder") {
            if (!parent.children) parent.children = [];
            const path = `${parent.path}/${name}`;
            const lang = getLanguageFromPath(path);
            parent.children.push({
              id,
              name,
              type,
              path,
              language: type === "file" ? lang : undefined,
              content: type === "file" ? "" : undefined,
              children: type === "folder" ? [] : undefined,
              isOpen: type === "folder" ? false : undefined,
            });
          } else {
            const path = `/${name}`;
            const lang = getLanguageFromPath(path);
            files.push({
              id,
              name,
              type,
              path,
              language: type === "file" ? lang : undefined,
              content: type === "file" ? "" : undefined,
              children: type === "folder" ? [] : undefined,
              isOpen: type === "folder" ? false : undefined,
            });
          }
          return { files };
        });
        return id;
      },

      deleteFile: (fileId) => {
        set((state) => {
          const files = JSON.parse(JSON.stringify(state.files)) as FileNode[];
          findParentAndRemove(files, fileId);
          const openTabs = state.openTabs.filter((t) => t.fileId !== fileId);
          const activeTabId =
            state.activeTabId &&
            state.openTabs.find((t) => t.id === state.activeTabId)?.fileId === fileId
              ? openTabs[openTabs.length - 1]?.id || null
              : state.activeTabId;
          return { files, openTabs, activeTabId };
        });
      },

      renameFile: (fileId, newName) => {
        set((state) => {
          const files = JSON.parse(JSON.stringify(state.files)) as FileNode[];
          const node = findFileById(files, fileId);
          if (node) {
            node.name = newName;
            const parts = node.path.split("/");
            parts[parts.length - 1] = newName;
            node.path = parts.join("/");
            if (node.type === "file") {
              node.language = getLanguageFromPath(newName);
            }
          }
          const openTabs = state.openTabs.map((t) =>
            t.fileId === fileId
              ? { ...t, fileName: newName, language: getLanguageFromPath(newName) }
              : t
          );
          return { files, openTabs };
        });
      },

      updateFileContent: (fileId, content) => {
        set((state) => {
          const files = JSON.parse(JSON.stringify(state.files)) as FileNode[];
          const node = findFileById(files, fileId);
          if (node) node.content = content;
          const openTabs = state.openTabs.map((t) =>
            t.fileId === fileId ? { ...t, isModified: true } : t
          );
          return { files, openTabs };
        });
        if (get().autoSave) {
          setTimeout(() => get().saveCurrentFile(), 1000);
        }
      },

      toggleFolder: (folderId) => {
        set((state) => {
          const files = JSON.parse(JSON.stringify(state.files)) as FileNode[];
          const node = findFileById(files, folderId);
          if (node && node.type === "folder") node.isOpen = !node.isOpen;
          return { files };
        });
      },

      openFile: (fileId) => {
        const state = get();
        const file = findFileById(state.files, fileId);
        if (!file || file.type === "folder") return;

        const existingTab = state.openTabs.find((t) => t.fileId === fileId);
        if (existingTab) {
          set({ activeTabId: existingTab.id });
          return;
        }

        const tab: Tab = {
          id: generateId(),
          fileId,
          fileName: file.name,
          filePath: file.path,
          language: file.language || getLanguageFromPath(file.name),
          isModified: false,
          isPinned: false,
        };
        set((s) => ({
          openTabs: [...s.openTabs, tab],
          activeTabId: tab.id,
        }));
      },

      closeTab: (tabId) => {
        set((state) => {
          const idx = state.openTabs.findIndex((t) => t.id === tabId);
          const openTabs = state.openTabs.filter((t) => t.id !== tabId);
          let activeTabId = state.activeTabId;
          if (activeTabId === tabId) {
            if (openTabs.length === 0) activeTabId = null;
            else if (idx >= openTabs.length) activeTabId = openTabs[openTabs.length - 1].id;
            else activeTabId = openTabs[idx]?.id || openTabs[idx - 1]?.id || null;
          }
          return { openTabs, activeTabId };
        });
      },

      setActiveTab: (tabId) => set({ activeTabId: tabId }),

      pinTab: (tabId) => {
        set((state) => ({
          openTabs: state.openTabs.map((t) =>
            t.id === tabId ? { ...t, isPinned: !t.isPinned } : t
          ),
        }));
      },

      closeOtherTabs: (tabId) => {
        set((state) => ({
          openTabs: state.openTabs.filter((t) => t.id === tabId || t.isPinned),
          activeTabId: tabId,
        }));
      },

      closeTabsToRight: (tabId) => {
        set((state) => {
          const idx = state.openTabs.findIndex((t) => t.id === tabId);
          const openTabs = state.openTabs.filter((t, i) => i <= idx || t.isPinned);
          return { openTabs };
        });
      },

      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setTabSize: (tabSize) => set({ tabSize }),
      setWordWrap: (wordWrap) => set({ wordWrap }),
      setMinimap: (minimap) => set({ minimap }),
      setLineNumbers: (lineNumbers) => set({ lineNumbers }),
      setAutoSave: (autoSave) => set({ autoSave }),
      setFontFamily: (fontFamily) => set({ fontFamily }),

      toggleSidebar: () => set((s) => ({ sidebarVisible: !s.sidebarVisible })),
      setSidebarVisible: (visible) => set({ sidebarVisible: visible }),
      togglePanel: () => set((s) => ({ panelVisible: !s.panelVisible })),
      setPanelHeight: (panelHeight) => set({ panelHeight }),
      setActivePanel: (activePanel) => set({ activePanel, panelVisible: true }),
      setActiveSidePanel: (activeSidePanel) => set({ activeSidePanel }),

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSearchResults: (searchResults) => set({ searchResults }),

      searchInFiles: (query) => {
        if (!query.trim()) {
          set({ searchResults: [] });
          return;
        }
        const files = getAllFilesFlat(get().files);
        const results: SearchResult[] = [];
        for (const file of files) {
          if (!file.content) continue;
          const lines = file.content.split("\n");
          const matches = [];
          for (let i = 0; i < lines.length; i++) {
            const idx = lines[i].toLowerCase().indexOf(query.toLowerCase());
            if (idx !== -1) {
              matches.push({
                line: i + 1,
                column: idx + 1,
                text: lines[i],
                preview: lines[i].trim().substring(0, 80),
              });
            }
          }
          if (matches.length > 0) {
            results.push({
              fileId: file.id,
              fileName: file.name,
              filePath: file.path,
              matches,
            });
          }
        }
        set({ searchResults: results });
      },

      addTerminalLine: (line) =>
        set((state) => ({
          terminalLines: [
            ...state.terminalLines,
            { ...line, id: generateId(), timestamp: Date.now() },
          ],
        })),

      clearTerminal: () =>
        set({
          terminalLines: [
            {
              id: generateId(),
              type: "info",
              content: "⚡ KM Code Terminal — type 'help' for commands.",
              timestamp: Date.now(),
            },
          ],
        }),

      executeCommand: (command) => {
        const { addTerminalLine } = get();
        addTerminalLine({ type: "input", content: `$ ${command}` });

        const trimmed = command.trim();
        if (!trimmed) return;

        if (trimmed === "clear") {
          get().clearTerminal();
          return;
        }

        if (trimmed === "help") {
          addTerminalLine({
            type: "output",
            content: `⚡ KM Code Terminal
─────────────────────────────
  run         → execute current file via Piston
  clear       → clear terminal
  help        → show this help
  ls          → list open files
  date        → show current date/time
─────────────────────────────
Supported languages: JS, TS, Python, Java, C++, C,
  Rust, Go, PHP, Ruby, Swift, Bash`,
          });
          return;
        }

        if (trimmed === "date") {
          addTerminalLine({ type: "output", content: new Date().toString() });
          return;
        }

        if (trimmed === "ls") {
          const files = getAllFilesFlat(get().files);
          addTerminalLine({
            type: "output",
            content: files.length > 0
              ? files.map((f) => f.name).join("  ")
              : "(no files)",
          });
          return;
        }

        if (trimmed === "run") {
          get().executeRun();
          return;
        }

        const parts = trimmed.split(/\s+/);
        addTerminalLine({
          type: "error",
          content: `bash: ${parts[0]}: command not found. Type "help" for available commands.`,
        });
      },

      addOutputLine: (line) =>
        set((state) => ({
          outputLines: [
            ...state.outputLines,
            { ...line, id: generateId(), timestamp: Date.now() },
          ],
        })),

      clearOutput: () => set({ outputLines: [], outputMeta: null }),

      executeRun: () => {
        const state = get();
        const { addTerminalLine, addOutputLine } = state;
        const activeTab = state.openTabs.find((t) => t.id === state.activeTabId);
        if (!activeTab) {
          addTerminalLine({ type: "error", content: "No file open. Open a file first." });
          return;
        }

        const file = findFileById(state.files, activeTab.fileId);

        // Always read from live editor view first — most up-to-date regardless
        // of whether the Zustand store has been synced (stale closure safety net)
        const liveView = getCurrentEditorView();
        let fileContent = liveView ? liveView.state.doc.toString() : (file?.content ?? "");
        // Secondary fallback: store content if live view is empty
        if (!fileContent.trim() && file?.content?.trim()) {
          fileContent = file.content;
        }

        if (!fileContent.trim()) {
          addTerminalLine({ type: "error", content: "File is empty — add some code first." });
          set({ panelVisible: true, activePanel: "terminal" });
          return;
        }

        // Derive language from tab first (EditorArea already applies getLanguageFromPath fallback)
        const lang = (activeTab.language || file?.language || getLanguageFromPath(activeTab.fileName)).toLowerCase();
        const runtime = LANGUAGE_RUNTIME[lang];
        if (!runtime) {
          addTerminalLine({
            type: "error",
            content: `"${lang}" cannot be executed. Supported: ${Object.keys(LANGUAGE_RUNTIME).join(", ")}`,
          });
          set({ panelVisible: true, activePanel: "terminal" });
          return;
        }

        const startMs = Date.now();
        set({
          outputLines: [],
          outputMeta: null,
          activePanel: "output",
          panelVisible: true,
          isRunning: true,
        });
        const fileName = file?.name ?? activeTab.fileName;
        addOutputLine({ type: "system", content: `▶  ${fileName}  ·  ${lang}` });
        addOutputLine({ type: "system", content: "─".repeat(40) });
        addTerminalLine({ type: "info", content: `▶ Running ${fileName} (${lang})...` });

        fetch(`${PISTON_URL}/execute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: runtime.language,
            version: runtime.version,
            files: [{ name: runtime.filename, content: fileContent }],
            run_timeout: 10000,
            compile_timeout: 10000,
          }),
        })
          .then((r) => r.json())
          .then((data) => {
            const run = data.run ?? {};
            const compile = data.compile ?? {};
            const durationMs = Date.now() - startMs;
            const exitCode = run.code ?? 0;

            if (compile.stderr) {
              compile.stderr.split("\n").filter(Boolean).forEach((l: string) => {
                addOutputLine({ type: "stderr", content: l });
                addTerminalLine({ type: "error", content: l });
              });
            } else {
              if (run.stdout) {
                run.stdout.split("\n").forEach((l: string) => {
                  addOutputLine({ type: "stdout", content: l });
                  addTerminalLine({ type: "output", content: l });
                });
              }
              if (run.stderr) {
                run.stderr.split("\n").filter(Boolean).forEach((l: string) => {
                  addOutputLine({ type: "stderr", content: l });
                  addTerminalLine({ type: "error", content: l });
                });
              }
            }

            addOutputLine({ type: "system", content: "─".repeat(40) });
            if (exitCode === 0) {
              addOutputLine({ type: "success", content: `✓  Exited 0  ·  ${durationMs}ms` });
            } else {
              addOutputLine({ type: "failure", content: `✗  Exited ${exitCode}  ·  ${durationMs}ms` });
            }
            addTerminalLine({
              type: exitCode === 0 ? "info" : "error",
              content: `─── Exited ${exitCode} (${durationMs}ms) ───`,
            });

            set({
              outputMeta: { exitCode, durationMs, language: lang, fileName },
              isRunning: false,
            });
          })
          .catch((err) => {
            addOutputLine({ type: "failure", content: `Failed to reach execution server: ${err.message}` });
            addTerminalLine({ type: "error", content: `Execution failed: ${err.message}` });
            set({ isRunning: false });
          });
      },

      setProblems: (problems) => set({ problems }),
      addProblem: (problem) =>
        set((state) => ({
          problems: [...state.problems, { ...problem, id: generateId() }],
        })),

      saveCurrentFile: () => {
        const state = get();
        const activeTab = state.openTabs.find((t) => t.id === state.activeTabId);
        if (activeTab) {
          const file = findFileById(state.files, activeTab.fileId);
          if (file && file.content !== undefined) {
            try {
              localStorage.setItem(
                `km-file-${file.path}`,
                JSON.stringify({
                  content: file.content,
                  savedAt: Date.now(),
                })
              );
            } catch {}
          }
        }
        set((state) => ({
          openTabs: state.openTabs.map((t) =>
            t.id === state.activeTabId ? { ...t, isModified: false } : t
          ),
        }));
      },

      setFilesFromApi: (files) => {
        set({ files, openTabs: [], activeTabId: null });
      },
    }),
    {
      name: "km-code-state",
      partialize: (state) => ({
        files: state.files,
        openTabs: state.openTabs,
        activeTabId: state.activeTabId,
        theme: state.theme,
        fontSize: state.fontSize,
        tabSize: state.tabSize,
        wordWrap: state.wordWrap,
        minimap: state.minimap,
        lineNumbers: state.lineNumbers,
        autoSave: state.autoSave,
        fontFamily: state.fontFamily,
        panelHeight: state.panelHeight,
      }),
    }
  )
);
