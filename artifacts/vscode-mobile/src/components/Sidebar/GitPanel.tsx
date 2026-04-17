import { GitBranch, GitCommit, GitMerge, RefreshCw, Plus, Check, AlertCircle } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { useState } from "react";

const STAGED_FILES = [
  { name: "src/main.ts", status: "M" },
  { name: "styles/main.css", status: "M" },
];

const UNSTAGED_FILES = [
  { name: "README.md", status: "M" },
  { name: "package.json", status: "?" },
];

export function GitPanel() {
  const { gitBranch } = useEditorStore();
  const [message, setMessage] = useState("");
  const [stagedFiles] = useState(STAGED_FILES);
  const [unstagedFiles] = useState(UNSTAGED_FILES);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "M": return "text-yellow-500";
      case "A": return "text-green-500";
      case "D": return "text-red-500";
      case "?": return "text-blue-400";
      default: return "text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "M": return "Modified";
      case "A": return "Added";
      case "D": return "Deleted";
      case "?": return "Untracked";
      default: return "Unknown";
    }
  };

  return (
    <div className="flex flex-col h-full" data-testid="git-panel">
      <div className="flex items-center justify-between px-3 py-2 border-b border-sidebar-border">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Source Control
        </span>
        <button
          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
          title="Refresh"
          data-testid="git-refresh"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto explorer-scroll">
        {/* Branch info */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-sidebar-border">
          <GitBranch size={14} className="text-primary" />
          <span className="text-sm text-foreground font-medium">{gitBranch}</span>
          <span className="ml-auto text-xs text-muted-foreground">
            ↑2 ↓0
          </span>
        </div>

        {/* Commit message */}
        <div className="px-2 py-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message (⌘Enter to commit)"
            className="w-full bg-input border border-border rounded text-sm p-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
            rows={3}
            data-testid="commit-message"
          />
          <button
            className="w-full mt-1 py-1.5 bg-primary text-primary-foreground text-sm rounded hover:opacity-90 flex items-center justify-center gap-2 font-medium transition-opacity"
            onClick={() => {
              if (message.trim()) {
                alert(`Committed: "${message}"`);
                setMessage("");
              }
            }}
            data-testid="commit-button"
          >
            <GitCommit size={14} />
            Commit
          </button>
        </div>

        {/* Staged changes */}
        {stagedFiles.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-3 py-1 text-xs font-semibold uppercase text-muted-foreground">
              <span>Staged Changes ({stagedFiles.length})</span>
            </div>
            {stagedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1 hover:bg-sidebar-accent cursor-pointer"
                data-testid={`staged-file-${idx}`}
              >
                <Check size={13} className="text-green-500" />
                <span className="flex-1 text-xs truncate text-foreground">{file.name}</span>
                <span className={`text-xs font-bold ${getStatusColor(file.status)}`}
                  title={getStatusLabel(file.status)}>
                  {file.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Unstaged changes */}
        {unstagedFiles.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-3 py-1 text-xs font-semibold uppercase text-muted-foreground">
              <span>Changes ({unstagedFiles.length})</span>
              <button
                className="hover:text-foreground"
                title="Stage All Changes"
                data-testid="stage-all"
              >
                <Plus size={13} />
              </button>
            </div>
            {unstagedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1 hover:bg-sidebar-accent cursor-pointer group"
                data-testid={`unstaged-file-${idx}`}
              >
                <AlertCircle size={13} className="text-muted-foreground" />
                <span className="flex-1 text-xs truncate text-foreground">{file.name}</span>
                <span className={`text-xs font-bold ${getStatusColor(file.status)}`}
                  title={getStatusLabel(file.status)}>
                  {file.status}
                </span>
                <button
                  className="hidden group-hover:flex p-0.5 rounded hover:bg-sidebar-accent"
                  title="Stage"
                >
                  <Plus size={12} className="text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Recent commits */}
        <div>
          <div className="px-3 py-1 text-xs font-semibold uppercase text-muted-foreground">
            Recent Commits
          </div>
          {[
            { hash: "a3f7d2e", msg: "feat: add user service", time: "2 hours ago" },
            { hash: "b1c4a9f", msg: "fix: update styles", time: "5 hours ago" },
            { hash: "c9d3b1a", msg: "docs: update README", time: "1 day ago" },
          ].map((commit, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 px-3 py-1.5 hover:bg-sidebar-accent cursor-pointer"
              data-testid={`commit-${idx}`}
            >
              <GitMerge size={13} className="text-primary mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-foreground truncate">{commit.msg}</div>
                <div className="text-xs text-muted-foreground">{commit.hash} · {commit.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
