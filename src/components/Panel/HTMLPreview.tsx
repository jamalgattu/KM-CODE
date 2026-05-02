import { useEditorStore } from "@/store/editorStore";
import { RefreshCw, ExternalLink } from "lucide-react";
import { useState, useCallback } from "react";

function findFileContent(nodes: ReturnType<typeof useEditorStore.getState>["files"], fileId: string): string | null {
  for (const node of nodes) {
    if (node.id === fileId) return node.content ?? "";
    if (node.children) {
      const found = findFileContent(node.children, fileId);
      if (found !== null) return found;
    }
  }
  return null;
}

export function HTMLPreview() {
  const { openTabs, activeTabId, files } = useEditorStore();
  const [key, setKey] = useState(0);

  const activeTab = openTabs.find((t) => t.id === activeTabId);
  const isHTMLFile = activeTab?.language === "html";

  const content = activeTab ? (findFileContent(files, activeTab.fileId) ?? "") : "";

  const handleRefresh = useCallback(() => {
    setKey((k) => k + 1);
  }, []);

  const handleOpenNew = useCallback(() => {
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }, [content]);

  if (!isHTMLFile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 p-6 text-center">
        <div className="text-4xl">🌐</div>
        <div className="text-sm font-medium text-foreground">HTML Preview</div>
        <div className="text-xs">Open an HTML file to see a live preview here.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" data-testid="html-preview">
      <div className="flex items-center justify-between px-3 py-1 border-b border-border bg-background shrink-0">
        <span className="text-xs text-muted-foreground font-mono truncate max-w-[60%]">
          {activeTab?.fileName}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
            title="Refresh Preview"
          >
            <RefreshCw size={13} />
          </button>
          <button
            onClick={handleOpenNew}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
            title="Open in New Tab"
          >
            <ExternalLink size={13} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden bg-white">
        <iframe
          key={key}
          srcDoc={content}
          title="HTML Preview"
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
          data-testid="html-iframe"
        />
      </div>
    </div>
  );
}
