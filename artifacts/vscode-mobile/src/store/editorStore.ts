import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EditorState, FileNode, Tab, TerminalLine, SearchResult, Problem, getLanguageFromPath } from "@/types/editor";

const DEFAULT_FILES: FileNode[] = [
  {
    id: "root",
    name: "my-project",
    type: "folder",
    path: "/my-project",
    isOpen: true,
    children: [
      {
        id: "src",
        name: "src",
        type: "folder",
        path: "/my-project/src",
        isOpen: true,
        children: [
          {
            id: "main-ts",
            name: "main.ts",
            type: "file",
            path: "/my-project/src/main.ts",
            language: "typescript",
            content: `// Welcome to Code Editor - VS Code for Mobile!
// Start writing your TypeScript code here

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

class UserService {
  private users: User[] = [];

  constructor() {
    this.loadSampleUsers();
  }

  private loadSampleUsers(): void {
    this.users = [
      { id: 1, name: "Alice Johnson", email: "alice@example.com", createdAt: new Date() },
      { id: 2, name: "Bob Smith", email: "bob@example.com", createdAt: new Date() },
      { id: 3, name: "Carol White", email: "carol@example.com", createdAt: new Date() },
    ];
  }

  getAll(): User[] {
    return this.users;
  }

  findById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  create(data: Omit<User, "id" | "createdAt">): User {
    const user: User = {
      ...data,
      id: this.users.length + 1,
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  update(id: number, data: Partial<User>): User | null {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    this.users[index] = { ...this.users[index], ...data };
    return this.users[index];
  }

  delete(id: number): boolean {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }
}

const service = new UserService();
const users = service.getAll();
console.log("Users:", users);

const newUser = service.create({ name: "Dave Brown", email: "dave@example.com" });
console.log("Created:", newUser);
`,
          },
          {
            id: "utils-ts",
            name: "utils.ts",
            type: "file",
            path: "/my-project/src/utils.ts",
            language: "typescript",
            content: `// Utility functions

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function randomId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
`,
          },
        ],
      },
      {
        id: "styles",
        name: "styles",
        type: "folder",
        path: "/my-project/styles",
        isOpen: false,
        children: [
          {
            id: "main-css",
            name: "main.css",
            type: "file",
            path: "/my-project/styles/main.css",
            language: "css",
            content: `/* Main Stylesheet */

:root {
  --primary: #007acc;
  --secondary: #1e1e1e;
  --accent: #569cd6;
  --bg: #252526;
  --text: #d4d4d4;
  --border: #444;
  --success: #4ec9b0;
  --warning: #dcdcaa;
  --error: #f44747;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background-color: var(--bg);
  color: var(--text);
  line-height: 1.6;
  font-size: 16px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s ease;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
}

.btn-primary:hover {
  background-color: #005f9e;
}

.card {
  background: #2d2d2d;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
}
`,
          },
        ],
      },
      {
        id: "index-html",
        name: "index.html",
        type: "file",
        path: "/my-project/index.html",
        language: "html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Project</title>
  <link rel="stylesheet" href="styles/main.css" />
</head>
<body>
  <header class="header">
    <div class="container">
      <nav class="nav">
        <div class="nav-brand">
          <span>My Project</span>
        </div>
        <ul class="nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main>
    <section id="home" class="hero">
      <div class="container">
        <h1 class="hero-title">Welcome to My Project</h1>
        <p class="hero-subtitle">Building something amazing</p>
        <button class="btn btn-primary" onclick="handleClick()">
          Get Started
        </button>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container">
      <p>&copy; 2024 My Project. All rights reserved.</p>
    </div>
  </footer>

  <script type="module" src="src/main.ts"></script>
</body>
</html>
`,
      },
      {
        id: "package-json",
        name: "package.json",
        type: "file",
        path: "/my-project/package.json",
        language: "json",
        content: `{
  "name": "my-project",
  "version": "1.0.0",
  "description": "A modern TypeScript project",
  "main": "dist/main.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint src --ext ts,tsx",
    "format": "prettier --write src/**/*.{ts,tsx}"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "vitest": "^1.0.0"
  }
}
`,
      },
      {
        id: "readme-md",
        name: "README.md",
        type: "file",
        path: "/my-project/README.md",
        language: "markdown",
        content: `# My Project

A modern TypeScript project with React and Vite.

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8

### Installation

\`\`\`bash
pnpm install
\`\`\`

### Development

\`\`\`bash
pnpm dev
\`\`\`

Opens the app at [http://localhost:5173](http://localhost:5173).

### Build

\`\`\`bash
pnpm build
\`\`\`

### Testing

\`\`\`bash
pnpm test
\`\`\`

## Project Structure

\`\`\`
my-project/
├── src/
│   ├── main.ts       # Entry point
│   └── utils.ts      # Utility functions
├── styles/
│   └── main.css      # Main stylesheet
├── index.html        # HTML entry
├── package.json
└── README.md
\`\`\`

## License

MIT
`,
      },
      {
        id: "gitignore",
        name: ".gitignore",
        type: "file",
        path: "/my-project/.gitignore",
        language: "plaintext",
        content: `# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
.vite/

# Environment variables
.env
.env.local
.env.*.local

# IDE files
.vscode/settings.json
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Testing
coverage/

# TypeScript
*.tsbuildinfo
`,
      },
    ],
  },
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

interface EditorStore extends EditorState {
  terminalLines: TerminalLine[];

  // File operations
  addFile: (parentId: string, name: string, type: "file" | "folder") => string;
  deleteFile: (fileId: string) => void;
  renameFile: (fileId: string, newName: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  toggleFolder: (folderId: string) => void;
  getFileById: (fileId: string) => FileNode | null;
  getAllFiles: () => FileNode[];

  // Tab operations
  openFile: (fileId: string) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  pinTab: (tabId: string) => void;
  closeOtherTabs: (tabId: string) => void;
  closeTabsToRight: (tabId: string) => void;

  // Editor settings
  setTheme: (theme: "dark" | "light") => void;
  setFontSize: (size: number) => void;
  setTabSize: (size: number) => void;
  setWordWrap: (wrap: boolean) => void;
  setMinimap: (show: boolean) => void;
  setLineNumbers: (show: boolean) => void;
  setAutoSave: (autoSave: boolean) => void;
  setFontFamily: (font: string) => void;

  // UI state
  toggleSidebar: () => void;
  setSidebarVisible: (visible: boolean) => void;
  togglePanel: () => void;
  setPanelHeight: (height: number) => void;
  setActivePanel: (panel: EditorState["activePanel"]) => void;
  setActiveSidePanel: (panel: EditorState["activeSidePanel"]) => void;

  // Search
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchResult[]) => void;
  searchInFiles: (query: string) => void;

  // Terminal
  addTerminalLine: (line: Omit<TerminalLine, "id" | "timestamp">) => void;
  clearTerminal: () => void;
  executeCommand: (command: string) => void;

  // Problems
  setProblems: (problems: Problem[]) => void;
  addProblem: (problem: Omit<Problem, "id">) => void;

  // Save
  saveCurrentFile: () => void;
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

function buildPath(nodes: FileNode[], id: string, parentPath = ""): string {
  for (const node of nodes) {
    if (node.id === id) return `${parentPath}/${node.name}`;
    if (node.children) {
      const found = buildPath(node.children, id, `${parentPath}/${node.name}`);
      if (found) return found;
    }
  }
  return "";
}

const TERMINAL_COMMANDS: Record<string, (args: string[]) => string> = {
  help: () =>
    `Available commands:
  help          Show this help message
  ls            List files in current directory  
  pwd           Print working directory
  echo [text]   Print text to terminal
  date          Show current date and time
  clear         Clear terminal
  node -v       Show Node.js version
  tsc --version Show TypeScript version
  git status    Show git status
  git log       Show git log
  npm run dev   Start development server
  npm run build Build the project
  npm test      Run tests`,
  ls: () =>
    `index.html    package.json  README.md     .gitignore
src/          styles/`,
  pwd: () => "/my-project",
  date: () => new Date().toString(),
  node: (args) =>
    args.includes("-v") || args.includes("--version") ? "v20.11.0" : "Usage: node [script]",
  tsc: (args) =>
    args.includes("--version") || args.includes("-v")
      ? "Version 5.3.3"
      : "TypeScript compilation successful.",
  git: (args) => {
    if (args[0] === "status")
      return `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  
        modified:   src/main.ts
        modified:   styles/main.css

Untracked files:
  (use "git add <file>..." to include in what will be committed)

no changes added to commit`;
    if (args[0] === "log")
      return `commit a3f7d2e (HEAD -> main, origin/main)
Author: Developer <dev@example.com>
Date:   ${new Date().toDateString()}

    feat: add user service with CRUD operations

commit b1c4a9f
Author: Developer <dev@example.com>
Date:   Sat Apr 15 10:00:00 2024 +0000

    initial commit`;
    return `git: '${args[0]}' is not a git command.`;
  },
  npm: (args) => {
    if (args[0] === "run" && args[1] === "dev")
      return `  VITE v5.0.0  ready in 432 ms
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.1:5173/`;
    if (args[0] === "run" && args[1] === "build")
      return `vite v5.0.0 building for production...
✓ 42 modules transformed.
dist/index.html        1.24 kB │ gzip: 0.62 kB
dist/assets/index.js   87.32 kB │ gzip: 32.41 kB
✓ built in 1.24s`;
    if (args[0] === "test")
      return `✓ src/utils.test.ts (4 tests) 12ms
✓ src/service.test.ts (8 tests) 23ms
 
Test Files  2 passed (2)
     Tests  12 passed (12)
  Duration  38ms`;
    return `npm: unknown command "${args.join(" ")}"`;
  },
  echo: (args) => args.join(" "),
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
      panelHeight: 200,
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
          content: "Welcome to Code Editor Terminal. Type 'help' for available commands.",
          timestamp: Date.now(),
        },
      ],

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
              content: "Terminal cleared.",
              timestamp: Date.now(),
            },
          ],
        }),

      executeCommand: (command) => {
        const { addTerminalLine } = get();
        addTerminalLine({ type: "input", content: `$ ${command}` });

        const parts = command.trim().split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        if (cmd === "clear") {
          get().clearTerminal();
          return;
        }

        const handler = TERMINAL_COMMANDS[cmd];
        if (handler) {
          const output = handler(args);
          addTerminalLine({ type: "output", content: output });
        } else if (cmd === "") {
          // no-op
        } else {
          addTerminalLine({
            type: "error",
            content: `bash: ${cmd}: command not found. Type 'help' for available commands.`,
          });
        }
      },

      setProblems: (problems) => set({ problems }),
      addProblem: (problem) =>
        set((state) => ({
          problems: [...state.problems, { ...problem, id: generateId() }],
        })),

      saveCurrentFile: () => {
        set((state) => ({
          openTabs: state.openTabs.map((t) =>
            t.id === state.activeTabId ? { ...t, isModified: false } : t
          ),
        }));
      },
    }),
    {
      name: "vscode-mobile-state",
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
