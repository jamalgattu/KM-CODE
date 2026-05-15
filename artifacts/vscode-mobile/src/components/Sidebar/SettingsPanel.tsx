import { Settings } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { EDITOR_THEMES } from "@/lib/editorThemes";
import { cn } from "@/lib/utils";

const FONT_FAMILIES = [
  "JetBrains Mono",
  "Fira Code",
  "Cascadia Code",
  "Consolas",
  "Monaco",
  "Menlo",
  "Courier New",
];

const THEME_PREVIEW: Record<string, { bg: string; gutter: string; keyword: string; string: string }> = {
  "dark":         { bg: "#282c34", gutter: "#21252b", keyword: "#c678dd", string: "#98c379" },
  "dracula":      { bg: "#282a36", gutter: "#21222c", keyword: "#ff79c6", string: "#f1fa8c" },
  "monokai":      { bg: "#272822", gutter: "#1e1f1c", keyword: "#f92672", string: "#e6db74" },
  "nord":         { bg: "#2e3440", gutter: "#3b4252", keyword: "#81a1c1", string: "#a3be8c" },
  "github-dark":  { bg: "#0d1117", gutter: "#161b22", keyword: "#ff7b72", string: "#a5d6ff" },
  "catppuccin":   { bg: "#1e1e2e", gutter: "#181825", keyword: "#cba6f7", string: "#a6e3a1" },
  "light":        { bg: "#f8fafc", gutter: "#f1f5f9", keyword: "#7c3aed", string: "#16a34a" },
  "solarized":    { bg: "#fdf6e3", gutter: "#eee8d5", keyword: "#859900", string: "#2aa198" },
  "github-light": { bg: "#ffffff", gutter: "#f6f8fa", keyword: "#cf222e", string: "#0a3069" },
};

function ThemePreviewSwatch({ themeId }: { themeId: string }) {
  const p = THEME_PREVIEW[themeId] ?? { bg: "#1e1e1e", gutter: "#252525", keyword: "#888", string: "#aaa" };
  return (
    <div
      className="w-full h-8 rounded overflow-hidden flex gap-0 border border-black/20"
      style={{ backgroundColor: p.bg }}
    >
      <div className="w-4 shrink-0 h-full opacity-80" style={{ backgroundColor: p.gutter }} />
      <div className="flex-1 flex flex-col justify-center gap-0.5 px-1 py-0.5">
        <div className="flex gap-0.5">
          <div className="h-1 rounded-full w-4" style={{ backgroundColor: p.keyword }} />
          <div className="h-1 rounded-full w-5 opacity-40" style={{ backgroundColor: p.keyword }} />
        </div>
        <div className="flex gap-0.5">
          <div className="h-1 rounded-full w-6" style={{ backgroundColor: p.string }} />
          <div className="h-1 rounded-full w-3 opacity-40" style={{ backgroundColor: p.string }} />
        </div>
      </div>
    </div>
  );
}

export function SettingsPanel() {
  const {
    theme, setTheme,
    fontSize, setFontSize,
    tabSize, setTabSize,
    wordWrap, setWordWrap,
    minimap, setMinimap,
    lineNumbers, setLineNumbers,
    autoSave, setAutoSave,
    fontFamily, setFontFamily,
  } = useEditorStore();

  return (
    <div className="flex flex-col h-full" data-testid="settings-panel">
      <div className="flex items-center justify-between px-3 py-2 border-b border-sidebar-border">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Settings
        </span>
        <Settings size={14} className="text-muted-foreground" />
      </div>

      <div className="flex-1 overflow-y-auto explorer-scroll px-3 py-2 space-y-5">

        {/* Color Theme */}
        <div>
          <div className="text-xs font-semibold text-foreground mb-2">Color Theme</div>
          <div className="grid grid-cols-3 gap-1.5">
            {EDITOR_THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                data-testid={`theme-${t.id}`}
                className={cn(
                  "flex flex-col gap-1 p-1.5 rounded-lg border transition-all",
                  theme === t.id
                    ? "border-primary ring-1 ring-primary/40 bg-primary/5"
                    : "border-border hover:border-border/60 hover:bg-sidebar-accent"
                )}
              >
                <ThemePreviewSwatch themeId={t.id} />
                <span className="text-[10px] text-center leading-tight truncate w-full text-muted-foreground">
                  {t.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Font Family */}
        <div>
          <div className="text-xs font-semibold text-foreground mb-2">Font Family</div>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full bg-input border border-border rounded text-sm px-2 py-1.5 text-foreground focus:outline-none focus:border-primary"
            data-testid="font-family-select"
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f} value={f} style={{ fontFamily: f }}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-foreground">Font Size</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFontSize(Math.max(fontSize - 1, 10))}
                className="w-5 h-5 rounded border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent flex items-center justify-center"
              >−</button>
              <span className="text-xs text-foreground font-mono w-8 text-center">{fontSize}px</span>
              <button
                onClick={() => setFontSize(Math.min(fontSize + 1, 36))}
                className="w-5 h-5 rounded border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent flex items-center justify-center"
              >+</button>
            </div>
          </div>
          <input
            type="range"
            min={10}
            max={36}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full accent-primary"
            data-testid="font-size-slider"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>10px</span>
            <span>36px</span>
          </div>
        </div>

        {/* Tab Size */}
        <div>
          <div className="text-xs font-semibold text-foreground mb-2">Tab Size</div>
          <div className="flex gap-1">
            {[2, 4, 8].map((size) => (
              <button
                key={size}
                onClick={() => setTabSize(size)}
                className={cn(
                  "flex-1 py-1 text-xs rounded border transition-colors",
                  tabSize === size
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-sidebar-accent"
                )}
                data-testid={`tab-size-${size}`}
              >
                {size} spaces
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div>
          <div className="text-xs font-semibold text-foreground mb-2">Editor Options</div>
          <div className="space-y-3">
            {[
              { key: "wordWrap",    label: "Word Wrap",            value: wordWrap,    setter: setWordWrap },
              { key: "lineNumbers", label: "Line Numbers",         value: lineNumbers, setter: setLineNumbers },
              { key: "autoSave",    label: "Auto Save",            value: autoSave,    setter: setAutoSave },
              { key: "minimap",     label: "Minimap (desktop)",    value: minimap,     setter: setMinimap },
            ].map(({ key, label, value, setter }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-xs text-foreground">{label}</span>
                <button
                  onClick={() => setter(!value)}
                  className={cn(
                    "relative w-8 h-4 rounded-full transition-colors",
                    value ? "bg-primary" : "bg-muted"
                  )}
                  data-testid={`toggle-${key}`}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform",
                      value ? "translate-x-4" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Keyboard Shortcuts Reference */}
        <div>
          <div className="text-xs font-semibold text-foreground mb-2">Keyboard Shortcuts</div>
          <div className="space-y-1 text-xs text-muted-foreground">
            {[
              ["Ctrl+S",       "Save file"],
              ["Ctrl+Enter",   "Run code"],
              ["Ctrl+/",       "Toggle comment"],
              ["Ctrl+F",       "Find in file"],
              ["Ctrl+G",       "Go to line"],
              ["Ctrl+B",       "Toggle sidebar"],
              ["Ctrl+Shift+P", "Command palette"],
              ["Ctrl+`",       "Terminal"],
              ["Alt+↑↓",       "Move line up/down"],
              ["F11",          "Fullscreen"],
            ].map(([key, desc]) => (
              <div key={key} className="flex items-center justify-between">
                <kbd className="text-[10px] bg-muted border border-border rounded px-1 py-0.5 font-mono">{key}</kbd>
                <span className="text-right">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="pt-4 border-t border-border">
          <div className="text-xs font-semibold text-foreground mb-2">About</div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>Su Zai Zai Code v2.0</div>
            <div>Mobile-first IDE built with CodeMirror 6</div>
            <div>9 themes · 15 languages · AI assistant</div>
            <div className="mt-2">
              <a
                href="https://github.com/jamalgattu/KM-CODE"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View on GitHub ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
