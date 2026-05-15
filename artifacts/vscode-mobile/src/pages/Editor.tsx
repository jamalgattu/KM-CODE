import { useEffect, useCallback, useState } from "react";
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
import { GoToLineDialog } from "@/components/GoToLineDialog";
import { CommandPalette } from "@/components/CommandPalette";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBackendSync } from "@/hooks/useBackendSync";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { getCurrentEditorView } from "@/lib/editorView";
import { DARK_THEME_IDS } from "@/lib/editorThemes";
import type { AuthUser } from "@/hooks/useAuth";

const SIDEBAR_WIDTH_DESKTOP = 220;
const SIDEBAR_WIDTH_MOBILE  = 260;

interface EditorPageProps {
  authUser: AuthUser | null;
  onSignOut: () => Promise<void>;
}

export function EditorPage({ authUser, onSignOut }: EditorPageProps) {
  const {
    theme, sidebarVisible, openFile, saveCurrentFile,
    togglePanel, setActivePanel, panelVisible, toggleSidebar,
    setActiveSidePanel, files, executeRun, setSidebarVisible,
    isFullscreen, toggleFullscreen,
  } = useEditorStore();
  const isMobile = useIsMobile();

  const [goToLineOpen, setGoToLineOpen] = useState(false);
  const [docLines, setDocLines] = useState(0);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useBackendSync();
  useSwipeGesture();

  // Auto-close sidebar on mobile
  useEffect(() => {
    if (isMobile && sidebarVisible) setSidebarVisible(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  // Sync app theme (Tailwind dark class) with selected editor theme
  useEffect(() => {
    const root = document.documentElement;
    if (DARK_THEME_IDS.has(theme)) {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openTabs.length, files, openFile]);

  // Sync fullscreen with browser Fullscreen API
  useEffect(() => {
    if (isFullscreen) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  }, [isFullscreen]);

  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement && isFullscreen) toggleFullscreen();
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, [isFullscreen, toggleFullscreen]);

  const openGoToLine = useCallback(() => {
    const view = getCurrentEditorView();
    setDocLines(view?.state.doc.lines ?? 0);
    setGoToLineOpen(true);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === "s") { e.preventDefault(); saveCurrentFile(); }
      if (meta && e.key === "b") { e.preventDefault(); toggleSidebar(); }
      if (meta && e.key === "`") {
        e.preventDefault();
        setActivePanel("terminal");
        if (!panelVisible) togglePanel();
      }
      if (meta && e.key === "Enter") { e.preventDefault(); executeRun(); }
      if (meta && e.key === "g") { e.preventDefault(); openGoToLine(); }
      if (e.key === "F11") { e.preventDefault(); toggleFullscreen(); }
      if (meta && e.shiftKey && (e.key === "P" || e.key === "p")) {
        e.preventDefault();
        setCommandPaletteOpen(true);
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
      if (meta && e.shiftKey && e.key === "I") {
        e.preventDefault();
        setActivePanel("input");
        if (!panelVisible) togglePanel();
      }
    },
    [saveCurrentFile, toggleSidebar, togglePanel, setActivePanel, setActiveSidePanel,
     panelVisible, sidebarVisible, executeRun, openGoToLine, toggleFullscreen]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const sidebarWidth = isMobile ? SIDEBAR_WIDTH_MOBILE : SIDEBAR_WIDTH_DESKTOP;

  return (
    <div className="flex flex-col h-dvh w-screen overflow-hidden bg-background" data-testid="editor-page">
      <GoToLineDialog
        open={goToLineOpen}
        onClose={() => setGoToLineOpen(false)}
        totalLines={docLines}
      />

      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onGoToLine={() => { setCommandPaletteOpen(false); openGoToLine(); }}
        onNewFile={() => { setCommandPaletteOpen(false); setSidebarVisible(true); setActiveSidePanel("explorer"); }}
      />

      {!isFullscreen && (
        <TitleBar
          authUser={authUser}
          onSignOut={onSignOut}
          onGoToLine={openGoToLine}
          onCommandPalette={() => setCommandPaletteOpen(true)}
        />
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {/* Activity bar — hidden on mobile and in fullscreen */}
        {!isFullscreen && (
          <div className="hidden sm:flex h-full">
            <ActivityBar />
          </div>
        )}

        {/* Sidebar — overlay on mobile, inline on desktop */}
        {sidebarVisible && !isFullscreen && (
          <>
            {isMobile && (
              <div
                className="absolute inset-0 z-30 bg-black/40 sm:hidden"
                onClick={toggleSidebar}
              />
            )}
            <div
              className={
                isMobile
                  ? "absolute left-0 top-0 h-full z-40 bg-sidebar border-r border-sidebar-border overflow-hidden sidebar-transition shadow-xl"
                  : "h-full bg-sidebar border-r border-sidebar-border shrink-0 overflow-hidden sidebar-transition"
              }
              style={{ width: sidebarWidth }}
            >
              <Sidebar width={sidebarWidth} />
            </div>
          </>
        )}

        <div className="flex flex-col flex-1 overflow-hidden">
          {!isFullscreen && <TabBar />}
          <div className="flex-1 overflow-hidden">
            <EditorArea />
          </div>
          {!isFullscreen && <MobileSymbolBar />}
          {!isFullscreen && <BottomPanel />}
        </div>
      </div>

      {!isFullscreen && <FloatingRunButton />}
      {!isFullscreen && <StatusBar />}
    </div>
  );
}
