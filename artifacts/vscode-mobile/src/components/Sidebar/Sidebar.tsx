import { useEditorStore } from "@/store/editorStore";
import { FileExplorer } from "./FileExplorer";
import { SearchPanel } from "./SearchPanel";
import { GitPanel } from "./GitPanel";
import { ExtensionsPanel } from "./ExtensionsPanel";
import { SettingsPanel } from "./SettingsPanel";
import { cn } from "@/lib/utils";

interface SidebarProps {
  width: number;
}

export function Sidebar({ width }: SidebarProps) {
  const { activeSidePanel, sidebarVisible } = useEditorStore();

  if (!sidebarVisible) return null;

  return (
    <div
      className={cn(
        "flex flex-col h-full border-r border-sidebar-border bg-sidebar sidebar-transition overflow-hidden"
      )}
      style={{ width }}
      data-testid="sidebar"
    >
      {activeSidePanel === "explorer" && <FileExplorer />}
      {activeSidePanel === "search" && <SearchPanel />}
      {activeSidePanel === "git" && <GitPanel />}
      {activeSidePanel === "extensions" && <ExtensionsPanel />}
      {activeSidePanel === "settings" && <SettingsPanel />}
    </div>
  );
}
