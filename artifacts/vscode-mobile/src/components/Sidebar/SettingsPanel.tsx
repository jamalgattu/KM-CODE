import { Settings, Moon, Sun, Monitor } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";

const FONT_FAMILIES = [
  "JetBrains Mono",
  "Fira Code",
  "Cascadia Code",
  "Consolas",
  "Monaco",
  "Menlo",
  "Courier New",
];

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
        {/* Theme */}
        <div>
          <div className="text-xs font-semibold text-foreground mb-2">Color Theme</div>
          <div className="grid grid-cols-3 gap-1">
            {(["light", "dark"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex flex-col items-center gap-1 p-2 rounded border transition-colors ${
                  theme === t
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-border/80 hover:bg-sidebar-accent"
                }`}
                data-testid={`theme-${t}`}
              >
                {t === "light" ? <Sun size={18} /> : <Moon size={18} />}
                <span className="text-xs capitalize">{t === "dark" ? "Dark" : "Light"}</span>
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
            <span className="text-xs text-muted-foreground font-mono">{fontSize}px</span>
          </div>
          <input
            type="range"
            min={10}
            max={24}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full accent-primary"
            data-testid="font-size-slider"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>10px</span>
            <span>24px</span>
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
                className={`flex-1 py-1 text-xs rounded border transition-colors ${
                  tabSize === size
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-sidebar-accent"
                }`}
                data-testid={`tab-size-${size}`}
              >
                {size} spaces
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          {[
            { key: "wordWrap", label: "Word Wrap", value: wordWrap, setter: setWordWrap },
            { key: "minimap", label: "Minimap (desktop only)", value: minimap, setter: setMinimap },
            { key: "lineNumbers", label: "Line Numbers", value: lineNumbers, setter: setLineNumbers },
            { key: "autoSave", label: "Auto Save", value: autoSave, setter: setAutoSave },
          ].map(({ key, label, value, setter }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs text-foreground">{label}</span>
              <button
                onClick={() => setter(!value)}
                className={`relative w-8 h-4 rounded-full transition-colors ${
                  value ? "bg-primary" : "bg-muted"
                }`}
                data-testid={`toggle-${key}`}
              >
                <span
                  className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                    value ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Editor Info */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-xs font-semibold text-foreground mb-2">About</div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>Code Editor v1.0.0</div>
            <div>VS Code for Mobile</div>
            <div>Built with CodeMirror 6</div>
            <div className="mt-2 text-xs">
              <a href="https://github.com/jamalgattu/KM-CODE" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View on GitHub</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
