export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  content?: string;
  language?: string;
  children?: FileNode[];
  isOpen?: boolean;
  isModified?: boolean;
}

export interface Tab {
  id: string;
  fileId: string;
  fileName: string;
  filePath: string;
  language: string;
  isModified: boolean;
  isPinned: boolean;
}

export interface EditorState {
  files: FileNode[];
  openTabs: Tab[];
  activeTabId: string | null;
  theme: "dark" | "light";
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
  fontFamily: string;
  sidebarVisible: boolean;
  panelVisible: boolean;
  panelHeight: number;
  activePanel: "terminal" | "problems" | "output" | "search";
  activeSidePanel: "explorer" | "search" | "git" | "extensions" | "settings";
  searchQuery: string;
  searchResults: SearchResult[];
  gitBranch: string;
  problems: Problem[];
}

export interface SearchResult {
  fileId: string;
  fileName: string;
  filePath: string;
  matches: SearchMatch[];
}

export interface SearchMatch {
  line: number;
  column: number;
  text: string;
  preview: string;
}

export interface Problem {
  id: string;
  fileId: string;
  fileName: string;
  line: number;
  column: number;
  severity: "error" | "warning" | "info" | "hint";
  message: string;
  source: string;
}

export interface TerminalLine {
  id: string;
  type: "input" | "output" | "error" | "info";
  content: string;
  timestamp: number;
}

export const LANGUAGE_MAP: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  css: "css",
  scss: "css",
  html: "html",
  htm: "html",
  json: "json",
  md: "markdown",
  sql: "sql",
  rs: "rust",
  java: "java",
  cpp: "cpp",
  c: "cpp",
  h: "cpp",
  php: "php",
  xml: "xml",
  yaml: "yaml",
  yml: "yaml",
  sh: "shell",
  bash: "shell",
  txt: "plaintext",
};

export function getLanguageFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() || "";
  return LANGUAGE_MAP[ext] || "plaintext";
}

export function getFileIcon(name: string): { icon: string; color: string } {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  const iconMap: Record<string, { icon: string; color: string }> = {
    js: { icon: "js", color: "#f7df1e" },
    jsx: { icon: "jsx", color: "#61dafb" },
    ts: { icon: "ts", color: "#3178c6" },
    tsx: { icon: "tsx", color: "#3178c6" },
    py: { icon: "py", color: "#3776ab" },
    css: { icon: "css", color: "#264de4" },
    scss: { icon: "scss", color: "#cc6699" },
    html: { icon: "html", color: "#e34c26" },
    json: { icon: "json", color: "#f0c675" },
    md: { icon: "md", color: "#083fa1" },
    sql: { icon: "sql", color: "#e38c00" },
    rs: { icon: "rs", color: "#dea584" },
    java: { icon: "java", color: "#ed8b00" },
    cpp: { icon: "cpp", color: "#659bd3" },
    c: { icon: "c", color: "#659bd3" },
    php: { icon: "php", color: "#777bb4" },
    sh: { icon: "sh", color: "#89e051" },
    yaml: { icon: "yaml", color: "#cb171e" },
    yml: { icon: "yaml", color: "#cb171e" },
    xml: { icon: "xml", color: "#f1662a" },
    txt: { icon: "txt", color: "#888" },
    gitignore: { icon: "git", color: "#f54d27" },
  };
  return iconMap[ext] || { icon: ext || "file", color: "#888" };
}
