import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EditorState, FileNode, Tab, TerminalLine, OutputLine, OutputMeta, SearchResult, Problem, TestCase, getLanguageFromPath } from "@/types/editor";
import { getErrorHint, getStatusHint } from "@/lib/errorFormatter";
import { getCurrentEditorView } from "@/lib/editorView";

const DEFAULT_FILES: FileNode[] = [
  {
    id: "welcome-file",
    name: "welcome.md",
    type: "file",
    path: "/welcome.md",
    language: "markdown",
    content: `# Welcome to Su Zai Zai Code! ⚡

A free mobile-first code editor for everyone.

## Getting Started
1. Click the **+** button to create a new file (with starter templates!)
2. Select a language and start coding
3. Hit the **Run** button or press \`Ctrl+Enter\` to execute your code

## Supported Languages
JavaScript, TypeScript, Python, Java, C++, C, Rust, Go, PHP, Ruby, Swift, Bash

## Features
- **Syntax Highlighting** — VS Code-like colors for all languages
- **Templates** — create files with pre-filled starter code
- **HTML Preview** — live preview for HTML files
- **Mobile Symbol Bar** — quick-insert coding symbols on mobile
- **Download / Copy** — save or copy any file instantly
- **Swipe Gestures** — swipe right to open sidebar, left to close

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
  {
    id: "demo-python",
    name: "demo.py",
    type: "file",
    path: "/demo.py",
    language: "python",
    content: `# Su Zai Zai Code — syntax highlighting demo
# Hit Run (or Ctrl+Enter) to execute!

class Animal:
    def __init__(self, name: str, sound: str):
        self.name = name
        self.sound = sound

    def speak(self) -> str:
        return f"{self.name} says {self.sound}!"

    def __repr__(self) -> str:
        return f"Animal(name={self.name!r})"


def fibonacci(n: int) -> list[int]:
    """Return the first n Fibonacci numbers."""
    seq = [0, 1]
    for _ in range(n - 2):
        seq.append(seq[-1] + seq[-2])
    return seq[:n]


# --- main ---
animals = [
    Animal("Dog", "Woof"),
    Animal("Cat", "Meow"),
    Animal("Cow", "Moo"),
]

for animal in animals:
    print(animal.speak())

print()
print("Fibonacci:", fibonacci(10))
print("Done! ✓")
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
  setStdin: (stdin: string) => void;

  setProblems: (problems: Problem[]) => void;
  addProblem: (problem: Omit<Problem, "id">) => void;

  toggleFullscreen: () => void;
  addTestCase: () => void;
  removeTestCase: (id: string) => void;
  updateTestCase: (id: string, stdin: string, expectedOutput?: string) => void;
  setActiveTestCase: (id: string | null) => void;
  runAllTestCases: () => void;
  duplicateFile: (id: string) => void;

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

// Judge0 Community Edition — free public API, verified working 2026
// https://ce.judge0.com  (replaced Piston which went whitelist-only Feb 2026)
// base64_encoded=true is required for reliable stdin delivery on the free instance.
const JUDGE0_URL = "https://ce.judge0.com/submissions?base64_encoded=true&wait=true";

function b64enc(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}
function b64dec(str: string | null | undefined): string {
  if (!str) return "";
  try {
    const bin = atob(str);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch { return str; }
}
const JUDGE0_LANGS: Record<string, number> = {
  javascript: 63,
  typescript: 74,
  python:     71,
  python3:    71,
  java:       62,
  cpp:        54,
  c:          50,
  rust:       73,
  bash:       46,
  sh:         46,
  shell:      46,
  php:        68,
  go:         60,
  ruby:       72,
  swift:      83,
};

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      files: DEFAULT_FILES,
      openTabs: [
        { id: "tab-demo-python", fileId: "demo-python", fileName: "demo.py", filePath: "/demo.py", language: "python", isModified: false, isPinned: false },
      ],
      activeTabId: "tab-demo-python",
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
          content: "⚡ Su Zai Zai Code Terminal — type 'help' for commands.",
          timestamp: Date.now(),
        },
      ],
      outputLines: [],
      outputMeta: null,
      isRunning: false,
      stdin: "",
      isFullscreen: false,
      testCases: [],
      activeTestCaseId: null,

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
              content: "⚡ Su Zai Zai Code Terminal — type 'help' for commands.",
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
            content: `⚡ Su Zai Zai Code Terminal
─────────────────────────────
  run         → execute current file via Judge0
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

        // Rate limit: prevent spamming Judge0 CE (free public API)
        if (state.isRunning) return;
        const now = Date.now();
        const lastRun = (get() as { _lastRunAt?: number })._lastRunAt ?? 0;
        if (now - lastRun < 2000) {
          addTerminalLine({ type: "error", content: "Please wait a moment before running again." });
          return;
        }
        (get() as { _lastRunAt?: number })._lastRunAt = now;

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
        const languageId = JUDGE0_LANGS[lang];
        if (!languageId) {
          addTerminalLine({
            type: "error",
            content: `"${lang}" cannot be executed. Supported: ${Object.keys(JUDGE0_LANGS).filter((k,i,a)=>a.indexOf(k)===i).join(", ")}`,
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

        // Java: Judge0 CE compiles as Main.java and runs `java Main`.
        // If the user's public class is named anything other than Main it fails.
        // Fix: rename the public class (and all its references) to Main, then
        // strip the `public` modifier from all remaining class declarations.
        let submissionCode = fileContent;
        if (lang === "java") {
          let code = fileContent;
          const publicClassMatch = code.match(/\bpublic\s+class\s+(\w+)/);
          if (publicClassMatch && publicClassMatch[1] !== "Main") {
            const oldName = publicClassMatch[1];
            code = code.replace(new RegExp(`\\b${oldName}\\b`, "g"), "Main");
          }
          // Strip `public` from all class declarations (inner classes etc.)
          code = code.replace(/\bpublic(\s+(?:final\s+|abstract\s+)?class\b)/g, "$1");
          submissionCode = code;
        }

        // Judge0 CE — synchronous submission (wait=true returns result immediately)
        // base64_encoded=true: encode request fields, decode response fields.
        const stdinValue = get().stdin;
        const submissionBody: Record<string, unknown> = {
          source_code: b64enc(submissionCode),
          language_id: languageId,
        };
        if (stdinValue.length > 0) {
          submissionBody.stdin = b64enc(stdinValue);
          const lineCount = stdinValue.split("\n").filter(Boolean).length;
          addOutputLine({ type: "system", content: `↳  stdin: ${lineCount} line(s) provided` });
        } else {
          addOutputLine({ type: "system", content: `↳  stdin: none  (open Input tab to provide program input)` });
        }
        fetch(JUDGE0_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submissionBody),
        })
          .then((r) => r.json())
          .then((data) => {
            const durationMs = Date.now() - startMs;
            // Judge0 status: 3=Accepted, 6=Compile Error, others=Runtime Error
            const statusId: number = data.status?.id ?? 0;
            const accepted = statusId === 3;
            const exitCode = accepted ? 0 : statusId;

            const stdout = b64dec(data.stdout);
            const stderr = b64dec(data.stderr);
            const compileOutput = b64dec(data.compile_output);

            // Compile error takes priority
            if (compileOutput) {
              compileOutput.split("\n").filter(Boolean).forEach((l: string) => {
                addOutputLine({ type: "stderr", content: l });
                addTerminalLine({ type: "error", content: l });
              });
            } else {
              if (stdout) {
                stdout.split("\n").forEach((l: string) => {
                  addOutputLine({ type: "stdout", content: l });
                  addTerminalLine({ type: "output", content: l });
                });
              }
              if (stderr) {
                const stderrLines = stderr.split("\n").filter(Boolean);
                const seenHints = new Set<string>();
                stderrLines.forEach((l: string) => {
                  addOutputLine({ type: "stderr", content: l });
                  addTerminalLine({ type: "error", content: l });
                  const hint = getErrorHint(l, lang);
                  if (hint && !seenHints.has(hint)) {
                    seenHints.add(hint);
                    addOutputLine({ type: "hint", content: hint });
                  }
                });
              }
              if (!accepted && data.status?.description) {
                addOutputLine({ type: "stderr", content: `Runtime: ${data.status.description}` });
              }
              // Status-level hints (TLE, MLE, etc.)
              const statusHint = getStatusHint(statusId);
              if (statusHint && !accepted) {
                addOutputLine({ type: "hint", content: statusHint });
              }
            }

            addOutputLine({ type: "system", content: "─".repeat(40) });
            if (accepted) {
              addOutputLine({ type: "success", content: `✓  Exited 0  ·  ${durationMs}ms` });
            } else {
              addOutputLine({ type: "failure", content: `✗  ${data.status?.description ?? "Error"}  ·  ${durationMs}ms` });
            }
            addTerminalLine({
              type: accepted ? "info" : "error",
              content: `─── ${accepted ? "Exited 0" : data.status?.description ?? "Error"} (${durationMs}ms) ───`,
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

      setStdin: (stdin) => set({ stdin }),

      toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),

      addTestCase: () => {
        const id = generateId();
        set((state) => ({
          testCases: [
            ...state.testCases,
            { id, label: `Case ${state.testCases.length + 1}`, stdin: "", expectedOutput: "" },
          ],
          activeTestCaseId: id,
        }));
      },

      removeTestCase: (id) =>
        set((state) => {
          const cases = state.testCases.filter((c) => c.id !== id);
          const activeId =
            state.activeTestCaseId === id ? (cases[0]?.id ?? null) : state.activeTestCaseId;
          return { testCases: cases, activeTestCaseId: activeId };
        }),

      updateTestCase: (id, stdin, expectedOutput) =>
        set((state) => ({
          testCases: state.testCases.map((c) =>
            c.id === id
              ? { ...c, stdin, ...(expectedOutput !== undefined ? { expectedOutput } : {}) }
              : c
          ),
        })),

      setActiveTestCase: (id) => set({ activeTestCaseId: id }),

      runAllTestCases: async () => {
        const state = get();
        if (state.isRunning || state.testCases.length === 0) return;

        const activeTab = state.openTabs.find((t) => t.id === state.activeTabId);
        if (!activeTab) return;

        const file = findFileById(state.files, activeTab.fileId);
        const liveView = getCurrentEditorView();
        const fileContent = liveView ? liveView.state.doc.toString() : (file?.content ?? "");
        if (!fileContent.trim()) return;

        const lang = (activeTab.language || getLanguageFromPath(activeTab.fileName)).toLowerCase();
        const languageId = JUDGE0_LANGS[lang];
        if (!languageId) return;

        set({ isRunning: true, outputLines: [], outputMeta: null, activePanel: "output", panelVisible: true });

        const addLine = (line: Omit<OutputLine, "id" | "timestamp">) => get().addOutputLine(line);

        addLine({ type: "system", content: `▶  ${activeTab.fileName}  ·  ${lang}  ·  ${state.testCases.length} test case${state.testCases.length === 1 ? "" : "s"}` });
        addLine({ type: "system", content: "─".repeat(40) });

        let passed = 0;
        let failed = 0;

        for (let i = 0; i < state.testCases.length; i++) {
          const tc = state.testCases[i];
          if (i > 0) addLine({ type: "system", content: "" });
          addLine({ type: "system", content: `● ${tc.label}` });
          if (tc.stdin.trim()) {
            const preview = tc.stdin.split("\n")[0];
            addLine({ type: "hint", content: `  stdin: ${preview}${tc.stdin.includes("\n") ? " …" : ""}` });
          }

          try {
            const body: Record<string, unknown> = { source_code: b64enc(fileContent), language_id: languageId };
            if (tc.stdin.trim()) body.stdin = b64enc(tc.stdin);

            const resp = await fetch(JUDGE0_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });
            const data = await resp.json();
            const accepted = data.status?.id === 3;
            const durationMs = data.time ? Math.round(Number(data.time) * 1000) : 0;

            const tcStdout = b64dec(data.stdout);
            const tcStderr = b64dec(data.stderr);
            const tcCompile = b64dec(data.compile_output);

            if (tcCompile) {
              tcCompile.split("\n").filter(Boolean).forEach((l: string) => addLine({ type: "stderr", content: l }));
            }
            if (tcStdout) {
              tcStdout.split("\n").forEach((l: string) => addLine({ type: "stdout", content: l }));
            }
            if (tcStderr) {
              tcStderr.split("\n").filter(Boolean).forEach((l: string) => addLine({ type: "stderr", content: l }));
            }

            if (tc.expectedOutput.trim()) {
              const actual = tcStdout.trimEnd();
              const expected = tc.expectedOutput.trimEnd();
              if (actual === expected) {
                addLine({ type: "success", content: `✓ Passed${durationMs ? `  ·  ${durationMs}ms` : ""}` });
                passed++;
              } else {
                addLine({ type: "failure", content: `✗ Wrong Answer` });
                addLine({ type: "hint", content: `  Expected: ${expected.substring(0, 100)}` });
                failed++;
              }
            } else {
              if (accepted) {
                addLine({ type: "success", content: `✓ Accepted${durationMs ? `  ·  ${durationMs}ms` : ""}` });
                passed++;
              } else {
                addLine({ type: "failure", content: `✗ ${data.status?.description ?? "Error"}` });
                failed++;
              }
            }
          } catch {
            addLine({ type: "failure", content: `✗ Network error` });
            failed++;
          }
        }

        addLine({ type: "system", content: "─".repeat(40) });
        addLine({
          type: failed === 0 ? "success" : "failure",
          content: `${passed}/${state.testCases.length} passed`,
        });
        set({ isRunning: false });
      },

      duplicateFile: (id) => {
        const state = get();
        const file = findFileById(state.files, id);
        if (!file || file.type !== "file") return;
        const newId = generateId();
        const dotIdx = file.name.lastIndexOf(".");
        const base = dotIdx > 0 ? file.name.slice(0, dotIdx) : file.name;
        const ext = dotIdx > 0 ? file.name.slice(dotIdx) : "";
        const newName = `${base}_copy${ext}`;
        const dirPath = file.path.substring(0, file.path.lastIndexOf("/"));
        const fileLang = file.language;
        const fileContent = file.content;
        set((state) => {
          const files = JSON.parse(JSON.stringify(state.files)) as FileNode[];
          function insertAfter(nodes: FileNode[]): boolean {
            for (let i = 0; i < nodes.length; i++) {
              if (nodes[i].id === id) {
                nodes.splice(i + 1, 0, {
                  id: newId, name: newName, type: "file",
                  path: `${dirPath}/${newName}`,
                  language: fileLang, content: fileContent,
                });
                return true;
              }
              if (nodes[i].children && insertAfter(nodes[i].children!)) return true;
            }
            return false;
          }
          insertAfter(files);
          return { files };
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
        stdin: state.stdin,
        testCases: state.testCases,
        activeTestCaseId: state.activeTestCaseId,
      }),
    }
  )
);
