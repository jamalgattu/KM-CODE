import { useState } from "react";
import { Trash2 } from "lucide-react";

const OUTPUT_CHANNELS = ["Tasks", "Extension Host", "TypeScript", "ESLint"];

export function OutputPanel() {
  const [channel, setChannel] = useState("Tasks");
  const [output] = useState(`[1:00:00 PM] Starting compilation in watch mode...
[1:00:02 PM] Found 0 errors. Watching for file changes.
[1:00:05 PM] File change detected. Starting incremental compilation...
[1:00:06 PM] Found 0 errors. Watching for file changes.
ESLint: No issues found.
TypeScript: Compilation successful.`);

  return (
    <div className="flex flex-col h-full" data-testid="output-panel">
      <div className="flex items-center gap-2 px-3 py-1 border-b border-border bg-background shrink-0">
        <span className="text-xs font-medium text-muted-foreground">OUTPUT</span>
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="bg-input border border-border rounded text-xs px-1.5 py-0.5 text-foreground focus:outline-none"
          data-testid="output-channel"
        >
          {OUTPUT_CHANNELS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          className="ml-auto p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
          title="Clear Output"
          data-testid="clear-output"
        >
          <Trash2 size={13} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs text-foreground/80 bg-background whitespace-pre">
        {output}
      </div>
    </div>
  );
}
