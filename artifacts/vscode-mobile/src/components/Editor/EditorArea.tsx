import { useEditorStore } from "@/store/editorStore";
import { CodeEditor } from "./CodeEditor";
import { Files } from "lucide-react";

export function EditorArea() {
  const { openTabs, activeTabId, files, updateFileContent, openFile } = useEditorStore();

  const activeTab = openTabs.find((t) => t.id === activeTabId);

  const getFileContent = (fileId: string): string => {
    const findContent = (nodes: typeof files): string => {
      for (const node of nodes) {
        if (node.id === fileId) return node.content || "";
        if (node.children) {
          const found = findContent(node.children);
          if (found !== null) return found;
        }
      }
      return "";
    };
    return findContent(files);
  };

  if (!activeTab) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background gap-6 select-none">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center">
            <Files size={40} className="text-muted-foreground/50" />
          </div>
          <div className="text-center">
            <div className="text-base font-semibold text-foreground/70">Code Editor</div>
            <div className="text-sm text-muted-foreground mt-1">VS Code for Mobile</div>
          </div>
          <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground mt-2">
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs border border-border">⌘</kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs border border-border">P</kbd>
              <span>Quick Open File</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs border border-border">⌘</kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs border border-border">`</kbd>
              <span>Toggle Terminal</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 max-w-sm px-4">
          {[
            { label: "New File", hint: "Create a new file in explorer" },
            { label: "Open Terminal", hint: "Start typing commands" },
            { label: "Search Files", hint: "Find across all files" },
            { label: "Source Control", hint: "View git changes" },
          ].map(({ label, hint }) => (
            <button
              key={label}
              className="text-left p-3 rounded-lg border border-border hover:bg-sidebar-accent transition-colors"
              data-testid={`welcome-${label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="text-sm font-medium text-foreground">{label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const content = getFileContent(activeTab.fileId);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* File path breadcrumb */}
      <div className="flex items-center gap-1 px-3 py-1 text-xs text-muted-foreground border-b border-border/50 bg-background shrink-0">
        {activeTab.filePath.split("/").map((part, idx, arr) => (
          <span key={idx} className="flex items-center gap-1">
            {idx > 0 && <span className="text-border">/</span>}
            <span className={idx === arr.length - 1 ? "text-foreground" : ""}>
              {part}
            </span>
          </span>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <CodeEditor
          key={activeTab.fileId}
          fileId={activeTab.fileId}
          content={content}
          language={activeTab.language}
          onChange={(newContent) => updateFileContent(activeTab.fileId, newContent)}
        />
      </div>
    </div>
  );
}
