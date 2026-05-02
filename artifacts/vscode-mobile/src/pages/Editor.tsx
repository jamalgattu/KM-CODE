import { useEffect, useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";
import { ActivityBar } from "@/components/ActivityBar/ActivityBar";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { TitleBar } from "@/components/TitleBar/TitleBar";
import { TabBar } from "@/components/TabBar/TabBar";
import { EditorArea } from "@/components/Editor/EditorArea";
import { BottomPanel } from "@/components/Panel/BottomPanel";
import { StatusBar } from "@/components/StatusBar/StatusBar";
import { MobileSymbolBar } from "@/components/MobileSymbolBar";
import { FloatingRunButton } from "@/components/FloatingRunButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBackendSync } from "@/hooks/useBackendSync";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";

const SIDEBAR_WIDTH_DESKTOP = 220;
const SIDEBAR_WIDTH_MOBILE = 200;

export function EditorPage() {
  const {
    theme, sidebarVisible, openFile, saveCurrentFile,
    togglePanel, setActivePanel, panelVisible, toggleSidebar,
    setActiveSidePanel, files, executeRun,
  } = useEditorStore();
  const isMobile = useIsMobile();

  useBackendSync();
  useSwipeGesture();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const { openTabs } = useEditorStore();
  useEffect(() => {
    if (openTabs.length === 0 && files.length > 0) {
      const findFirstFile = (nodes: typeof files): string | null => {
        for (const node of nodes) {
          if (node.type === "file") return node.id;
          if (node.children) {
            const found = findFirstFile(node.children);
            if (found) return found;
          }
        }
        return null;
      };
      const firstFileId = findFirstFile(files);
      if (firstFileId) openFile(firstFileId);
    }
  }, [openTabs.length, files]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === "s") {
        e.preventDefault();
        saveCurrentFile();
      }
      if (meta && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      }
      if (meta && e.key === "`") {
        e.preventDefault();
        setActivePanel("terminal");
        if (!panelVisible) togglePanel();
      }
      if (meta && e.key === "Enter") {
        e.preventDefault();
        executeRun();
      }
      if (meta && e.shiftKey && e.key === "E") {
        e.preventDefault();
        setActiveSidePanel("explorer");
        if (!sidebarVisible) toggleSidebar();
      }
      if (meta && e.shiftKey && e.key === "F") {
        e.preventDefault();
        setActiveSidePanel("search");
        if (!sidebarVisible) toggleSidebar();
      }
      if (meta && e.shiftKey && e.key === "M") {
        e.preventDefault();
        setActivePanel("problems");
        if (!panelVisible) togglePanel();
      }
    },
    [saveCurrentFile, toggleSidebar, togglePanel, setActivePanel, setActiveSidePanel, panelVisible, sidebarVisible, executeRun]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const sidebarWidth = isMobile ? SIDEBAR_WIDTH_MOBILE : SIDEBAR_WIDTH_DESKTOP;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background" data-testid="editor-page">
      <TitleBar />

      <div className="flex flex-1 overflow-hidden">
        <ActivityBar />

        {sidebarVisible && (
          <div
            className="h-full bg-sidebar border-r border-sidebar-border shrink-0 overflow-hidden sidebar-transition"
            style={{ width: sidebarWidth }}
          >
            <Sidebar width={sidebarWidth} />
          </div>
        )}

        <div className="flex flex-col flex-1 overflow-hidden">
          <TabBar />

          <div className="flex-1 overflow-hidden">
            <EditorArea />
          </div>

          {/* Mobile symbol bar sits between editor and panel */}
          <MobileSymbolBar />

          <BottomPanel />
        </div>
      </div>

      <FloatingRunButton />
      <StatusBar />
    </div>
  );
}
