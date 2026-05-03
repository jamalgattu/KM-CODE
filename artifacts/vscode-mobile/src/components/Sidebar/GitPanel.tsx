import { GitBranch, GitCommit, GitMerge, RefreshCw, Plus } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { useState } from "react";

export function GitPanel() {
  const { gitBranch, openTabs, files } = useEditorStore();
  const [message, setMessage] = useState("");
  const [committed, setCommitted] = useState<{ hash: string; msg: string; time: string }[]>([]);

  const modifiedTabs = openTabs.filter((t) => t.isModified);

  const findFileName = (fileId: string): string => {
    const search = (nodes: typeof files): string | null => {
      for (const n of nodes) {
        if (n.id === fileId) return n.path || n.name;
        if (n.children) {
          const found = search(n.children);
          if (found !== null) return found;
        }
      }
      return null;
    };
    return search(files) ?? fileId;
  };

  const handleCommit = () => {
    if (!message.trim()) return;
    setCommitted((prev) => [
      { hash: Math.random().toString(36).slice(2, 9), msg: message, time: "just now" },
      ...prev,
    ]);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-full" data-testid="git-panel">
      <div className="flex items-center justify-between px-3 py-2 border-b border-sidebar-border">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Source Control
        </span>
        <RefreshCw size={14} className="text-muted-foreground" />
      </div>

      <div className="flex-1 overflow-y-auto explorer-scroll">
        {/* Branch info */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-sidebar-border">
          <GitBranch size={14} className="text-primary" />
          <span className="text-sm text-foreground font-medium">{gitBranch}</span>
        </div>

        {/* Commit message */}
        <div className="px-2 py-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message (Ctrl+Enter to commit)"
            className="w-full bg-input border border-border rounded text-sm p-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
            rows={3}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleCommit();
            }}
            data-testid="commit-message"
          />
          <button
            className="w-full mt-1 py-1.5 bg-primary text-primary-foreground text-sm rounded hover:opacity-90 flex items-center justify-center gap-2 font-medium transition-opacity disabled:opacity-40"
            onClick={handleCommit}
            disabled={!message.trim()}
            data-testid="commit-button"
          >
            <GitCommit size={14} />
            Commit
          </button>
        </div>

        {/* Unsaved changes */}
        {modifiedTabs.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-3 py-1 text-xs font-semibold uppercase text-muted-foreground">
              <span>Changes ({modifiedTabs.length})</span>
            </div>
            {modifiedTabs.map((tab) => (
              <div
                key={tab.id}
                className="flex items-center gap-2 px-3 py-1 hover:bg-sidebar-accent cursor-pointer group"
                data-testid={`changed-file-${tab.id}`}
              >
                <Plus size={13} className="text-muted-foreground" />
                <span className="flex-1 text-xs truncate text-foreground">
                  {findFileName(tab.fileId)}
                </span>
                <span className="text-xs font-bold text-yellow-500" title="Modified">M</span>
              </div>
            ))}
          </div>
        )}

        {modifiedTabs.length === 0 && (
          <div className="px-3 py-4 text-xs text-muted-foreground text-center">
            No unsaved changes
          </div>
        )}

        {/* Recent commits (session-local) */}
        {committed.length > 0 && (
          <div>
            <div className="px-3 py-1 text-xs font-semibold uppercase text-muted-foreground">
              Recent Commits
            </div>
            {committed.map((c, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 px-3 py-1.5 hover:bg-sidebar-accent cursor-pointer"
                data-testid={`commit-${idx}`}
              >
                <GitMerge size={13} className="text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-foreground truncate">{c.msg}</div>
                  <div className="text-xs text-muted-foreground">{c.hash} · {c.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
