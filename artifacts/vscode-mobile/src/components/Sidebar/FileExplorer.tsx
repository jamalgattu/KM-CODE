import { useState, useRef } from "react";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, FilePlus, FolderPlus, Trash2, Edit2, RefreshCw } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { FileNode } from "@/types/editor";
import { cn } from "@/lib/utils";

interface FileTreeItemProps {
  node: FileNode;
  depth: number;
  onSelect: (id: string) => void;
  selectedId: string | null;
}

function getExtColor(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  const colors: Record<string, string> = {
    ts: "#3178c6", tsx: "#3178c6", js: "#f7df1e", jsx: "#61dafb",
    py: "#3776ab", css: "#264de4", scss: "#cc6699", html: "#e34c26",
    json: "#f0c675", md: "#083fa1", sql: "#e38c00", rs: "#dea584",
    java: "#ed8b00", cpp: "#659bd3", c: "#659bd3", php: "#777bb4",
    sh: "#89e051", yaml: "#cb171e", yml: "#cb171e", xml: "#f1662a",
  };
  return colors[ext] || "#888";
}

function FileTreeItem({ node, depth, onSelect, selectedId }: FileTreeItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameName, setRenameName] = useState(node.name);
  const [showMenu, setShowMenu] = useState(false);
  const renameRef = useRef<HTMLInputElement>(null);

  const { openFile, toggleFolder, deleteFile, renameFile, addFile } = useEditorStore();

  const handleClick = () => {
    if (node.type === "folder") {
      toggleFolder(node.id);
    } else {
      openFile(node.id);
      onSelect(node.id);
    }
  };

  const handleRename = () => {
    if (renameName.trim() && renameName !== node.name) {
      renameFile(node.id, renameName.trim());
    }
    setIsRenaming(false);
    setShowMenu(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleRename();
    if (e.key === "Escape") {
      setRenameName(node.name);
      setIsRenaming(false);
    }
  };

  const isSelected = selectedId === node.id;

  return (
    <div>
      <div
        className={cn(
          "flex items-center h-7 px-2 text-sm cursor-pointer select-none group relative",
          "hover:bg-sidebar-accent/60 transition-colors",
          isSelected && "bg-sidebar-accent"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowMenu(!showMenu);
          onSelect(node.id);
        }}
        data-testid={`file-item-${node.id}`}
      >
        <span className="mr-1.5 flex items-center shrink-0">
          {node.type === "folder" ? (
            node.isOpen ? (
              <ChevronDown size={14} className="text-muted-foreground" />
            ) : (
              <ChevronRight size={14} className="text-muted-foreground" />
            )
          ) : (
            <span style={{ width: 14 }} />
          )}
        </span>

        <span className="mr-1.5 shrink-0">
          {node.type === "folder" ? (
            node.isOpen ? (
              <FolderOpen size={15} className="text-yellow-400" />
            ) : (
              <Folder size={15} className="text-yellow-400" />
            )
          ) : (
            <File size={14} style={{ color: getExtColor(node.name) }} />
          )}
        </span>

        {isRenaming ? (
          <input
            ref={renameRef}
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-input text-foreground text-sm px-1 border border-ring rounded outline-none"
            autoFocus
            onClick={(e) => e.stopPropagation()}
            data-testid="rename-input"
          />
        ) : (
          <span
            className={cn(
              "flex-1 truncate text-sm",
              node.type === "folder" ? "text-sidebar-foreground font-medium" : "text-sidebar-foreground"
            )}
          >
            {node.name}
          </span>
        )}

        <div className="hidden group-hover:flex items-center gap-0.5 ml-auto">
          {node.type === "folder" && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const name = prompt("File name:");
                  if (name) addFile(node.id, name, "file");
                  if (!node.isOpen) toggleFolder(node.id);
                }}
                className="p-0.5 rounded hover:bg-sidebar-accent text-muted-foreground hover:text-foreground"
                title="New File"
                data-testid={`new-file-${node.id}`}
              >
                <FilePlus size={13} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const name = prompt("Folder name:");
                  if (name) addFile(node.id, name, "folder");
                  if (!node.isOpen) toggleFolder(node.id);
                }}
                className="p-0.5 rounded hover:bg-sidebar-accent text-muted-foreground hover:text-foreground"
                title="New Folder"
                data-testid={`new-folder-${node.id}`}
              >
                <FolderPlus size={13} />
              </button>
            </>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsRenaming(true);
              setRenameName(node.name);
              setTimeout(() => renameRef.current?.select(), 10);
            }}
            className="p-0.5 rounded hover:bg-sidebar-accent text-muted-foreground hover:text-foreground"
            title="Rename"
            data-testid={`rename-${node.id}`}
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete "${node.name}"?`)) {
                deleteFile(node.id);
              }
            }}
            className="p-0.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
            title="Delete"
            data-testid={`delete-${node.id}`}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {node.type === "folder" && node.isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
          {node.children.length === 0 && (
            <div
              className="text-xs text-muted-foreground italic"
              style={{ paddingLeft: `${(depth + 1) * 12 + 8 + 14}px` }}
            >
              Empty folder
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function FileExplorer() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { files, addFile } = useEditorStore();

  const rootNode = files[0];

  return (
    <div className="flex flex-col h-full" data-testid="file-explorer">
      <div className="flex items-center justify-between px-3 py-2 border-b border-sidebar-border">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Explorer
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const name = prompt("File name:");
              if (name && rootNode) addFile(rootNode.id, name, "file");
            }}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
            title="New File"
            data-testid="explorer-new-file"
          >
            <FilePlus size={15} />
          </button>
          <button
            onClick={() => {
              const name = prompt("Folder name:");
              if (name && rootNode) addFile(rootNode.id, name, "folder");
            }}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
            title="New Folder"
            data-testid="explorer-new-folder"
          >
            <FolderPlus size={15} />
          </button>
          <button
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
            title="Refresh"
            data-testid="explorer-refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto explorer-scroll">
        {files.map((node) => (
          <FileTreeItem
            key={node.id}
            node={node}
            depth={0}
            onSelect={setSelectedId}
            selectedId={selectedId}
          />
        ))}
      </div>
    </div>
  );
}
