import { X, Pin, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { useEditorStore } from "@/store/editorStore";
import { Tab } from "@/types/editor";
import { cn } from "@/lib/utils";

function getTabColor(language: string): string {
  const colors: Record<string, string> = {
    typescript: "#3178c6",
    javascript: "#f7df1e",
    python: "#3776ab",
    css: "#264de4",
    html: "#e34c26",
    json: "#f0c675",
    markdown: "#083fa1",
    rust: "#dea584",
    java: "#ed8b00",
    cpp: "#659bd3",
    sql: "#e38c00",
    php: "#777bb4",
  };
  return colors[language] || "#888";
}

function TabItem({ tab }: { tab: Tab }) {
  const { activeTabId, setActiveTab, closeTab, pinTab } = useEditorStore();
  const isActive = tab.id === activeTabId;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 sm:px-3 h-full cursor-pointer select-none shrink-0 group border-r border-border/50 transition-colors relative",
        isActive
          ? "bg-background text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
      style={{ maxWidth: 160, minWidth: 80 }}
      onClick={() => setActiveTab(tab.id)}
      data-testid={`tab-${tab.id}`}
    >
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0 opacity-70"
        style={{ backgroundColor: getTabColor(tab.language) }}
      />
      <span className="text-xs truncate flex-1">{tab.fileName}</span>
      {tab.isModified && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"
          title="Unsaved changes"
        />
      )}
      {tab.isPinned && (
        <Pin size={10} className="text-muted-foreground shrink-0" />
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          closeTab(tab.id);
        }}
        className={cn(
          "p-1 sm:p-0.5 rounded hover:bg-sidebar-accent shrink-0 transition-opacity touch-manipulation",
          isActive ? "opacity-100" : "opacity-60 sm:opacity-0 sm:group-hover:opacity-100"
        )}
        title="Close"
        data-testid={`close-tab-${tab.id}`}
      >
        <X size={13} className="sm:w-3 sm:h-3" />
      </button>
    </div>
  );
}

export function TabBar() {
  const { openTabs, activeTabId } = useEditorStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -120, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 120, behavior: "smooth" });
  };

  if (openTabs.length === 0) {
    return (
      <div className="flex items-center h-9 border-b border-border bg-muted/30 px-3">
        <span className="text-xs text-muted-foreground">No files open</span>
      </div>
    );
  }

  return (
    <div className="flex items-center h-10 sm:h-9 border-b border-border bg-muted/30 overflow-hidden" data-testid="tab-bar">
      {openTabs.length > 4 && (
        <button
          onClick={scrollLeft}
          className="px-1 h-full flex items-center text-muted-foreground hover:text-foreground shrink-0"
          data-testid="tab-scroll-left"
        >
          <ChevronLeft size={14} />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex h-full overflow-x-auto tabs-scroll"
        style={{ scrollbarWidth: "none" }}
      >
        {openTabs.map((tab) => (
          <TabItem key={tab.id} tab={tab} />
        ))}
      </div>

      {openTabs.length > 4 && (
        <button
          onClick={scrollRight}
          className="px-1 h-full flex items-center text-muted-foreground hover:text-foreground shrink-0"
          data-testid="tab-scroll-right"
        >
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}
