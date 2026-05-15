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
  theme: string;
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
  activePanel: "terminal" | "problems" | "output" | "search" | "preview" | "input" | "ai";
  activeSidePanel: "explorer" | "search" | "git" | "extensions" | "settings";
  stdin: string;
  isFullscreen: boolean;
  testCases: TestCase[];
  activeTestCaseId: string | null;
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

export interface TestCase {
  id: string;
  label: string;
  stdin: string;
  expectedOutput: string;
}

export interface OutputLine {
  id: string;
  type: "stdout" | "stderr" | "system" | "success" | "failure" | "hint";
  content: string;
  timestamp: number;
}

export interface OutputMeta {
  exitCode: number;
  durationMs: number;
  language: string;
  fileName: string;
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
  c: "c",
  h: "cpp",
  php: "php",
  xml: "xml",
  yaml: "yaml",
  yml: "yaml",
  sh: "bash",
  bash: "bash",
  go: "go",
  rb: "ruby",
  swift: "swift",
  txt: "plaintext",
};

export function getLanguageFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() || "";
  return LANGUAGE_MAP[ext] || "plaintext";
}

const SHEBANG_MAP: Record<string, string> = {
  python: "python", python3: "python", node: "javascript",
  bash: "bash", sh: "bash", ruby: "ruby", php: "php",
  perl: "perl", swift: "swift", go: "go",
};

export function detectLanguage(filename: string, content: string): string {
  // 1. Extension-based detection (most reliable)
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (ext && LANGUAGE_MAP[ext]) return LANGUAGE_MAP[ext];

  // 2. Shebang line detection
  const firstLine = content.split("\n")[0]?.trim() || "";
  if (firstLine.startsWith("#!")) {
    const parts = firstLine.replace(/^#!\s*/, "").split(/[\s/]+/);
    const interpreter = parts[parts.length - 1].replace("env", "").trim() || parts[0];
    for (const [key, lang] of Object.entries(SHEBANG_MAP)) {
      if (interpreter.toLowerCase().includes(key)) return lang;
    }
  }

  // 3. Content heuristics
  if (/^\s*<\?xml/i.test(content))        return "xml";
  if (/^\s*<!DOCTYPE html/i.test(content)) return "html";
  if (/^\s*<html/i.test(content))          return "html";
  if (/^\s*package\s+\w+\s*;/.test(content) && content.includes("class")) return "java";
  if (/^\s*(pub\s+)?(fn|use|mod|struct|enum|impl)\s/.test(content)) return "rust";
  if (/^\s*package main/.test(content) || content.includes("func main()")) return "go";
  if (/^\s*(#include|using namespace|int main\s*\()/.test(content)) return "cpp";
  if (/^\s*(def |class |import |from .+ import)/.test(content)) return "python";
  if (/^\s*(const|let|var|function|=>|require\s*\(|module\.exports)/.test(content)) return "javascript";
  if (/(interface|type\s+\w+\s*=|:\s*(string|number|boolean|void))/.test(content)) return "typescript";
  if (/^\s*(\{|\[)\s*$/.test(content.split("\n")[0] || "")) return "json";
  if (/^---/.test(content) || /^\w+:/.test(firstLine)) return "yaml";

  return "plaintext";
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
    go: { icon: "go", color: "#00add8" },
    rb: { icon: "rb", color: "#cc342d" },
    swift: { icon: "swift", color: "#fa7343" },
    txt: { icon: "txt", color: "#888" },
    gitignore: { icon: "git", color: "#f54d27" },
  };
  return iconMap[ext] || { icon: ext || "file", color: "#888" };
}
