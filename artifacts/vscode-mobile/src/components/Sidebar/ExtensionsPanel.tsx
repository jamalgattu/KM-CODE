import { Package, Star, Download, Search, X } from "lucide-react";
import { useState } from "react";

const EXTENSIONS = [
  {
    id: "prettier",
    name: "Prettier - Code formatter",
    publisher: "Prettier",
    description: "Code formatter using prettier",
    version: "10.4.0",
    downloads: "36M",
    stars: 4.8,
    installed: true,
    category: "Formatter",
    color: "#f7b93e",
  },
  {
    id: "eslint",
    name: "ESLint",
    publisher: "Microsoft",
    description: "Integrates ESLint JavaScript into VS Code.",
    version: "3.0.5",
    downloads: "30M",
    stars: 4.7,
    installed: true,
    category: "Linter",
    color: "#4b32c3",
  },
  {
    id: "gitgraph",
    name: "Git Graph",
    publisher: "mhutchie",
    description: "View a Git Graph of your repository, and perform Git actions from the graph.",
    version: "1.30.0",
    downloads: "5M",
    stars: 4.9,
    installed: false,
    category: "SCM",
    color: "#f05033",
  },
  {
    id: "tailwind",
    name: "Tailwind CSS IntelliSense",
    publisher: "Tailwind Labs",
    description: "Intelligent Tailwind CSS tooling for VS Code",
    version: "0.11.8",
    downloads: "12M",
    stars: 4.9,
    installed: true,
    category: "Other",
    color: "#06b6d4",
  },
  {
    id: "auto-rename",
    name: "Auto Rename Tag",
    publisher: "Jun Han",
    description: "Auto rename paired HTML/XML tag",
    version: "0.1.10",
    downloads: "15M",
    stars: 4.6,
    installed: false,
    category: "Other",
    color: "#e56bfe",
  },
  {
    id: "bracket-pair",
    name: "Rainbow CSV",
    publisher: "mechatroner",
    description: "Highlight CSV and TSV files, Run SQL-like queries",
    version: "3.11.0",
    downloads: "8M",
    stars: 4.7,
    installed: false,
    category: "Other",
    color: "#f05033",
  },
];

export function ExtensionsPanel() {
  const [query, setQuery] = useState("");
  const [installed, setInstalled] = useState<Set<string>>(
    new Set(EXTENSIONS.filter((e) => e.installed).map((e) => e.id))
  );

  const filtered = EXTENSIONS.filter(
    (e) =>
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.description.toLowerCase().includes(query.toLowerCase())
  );

  const toggleInstall = (id: string) => {
    setInstalled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full" data-testid="extensions-panel">
      <div className="flex items-center justify-between px-3 py-2 border-b border-sidebar-border">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Extensions
        </span>
      </div>

      <div className="px-2 py-2">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Extensions..."
            className="w-full bg-input border border-border rounded text-sm pl-8 pr-8 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            data-testid="extensions-search"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto explorer-scroll px-2">
        {!query && (
          <div className="text-xs font-semibold uppercase text-muted-foreground px-1 pb-1">
            Installed ({installed.size})
          </div>
        )}
        <div className="space-y-1">
          {filtered.map((ext) => (
            <div
              key={ext.id}
              className="p-2 rounded border border-border hover:bg-sidebar-accent/50 cursor-pointer transition-colors"
              data-testid={`extension-${ext.id}`}
            >
              <div className="flex items-start gap-2">
                <div
                  className="w-10 h-10 rounded flex items-center justify-center shrink-0 text-white font-bold text-sm"
                  style={{ backgroundColor: ext.color }}
                >
                  {ext.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {ext.name}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">{ext.publisher}</div>
                  <div className="text-xs text-foreground/70 mt-0.5 line-clamp-2">
                    {ext.description}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      <Star size={11} className="text-yellow-500 fill-yellow-500" />
                      <span>{ext.stars}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      <Download size={11} />
                      <span>{ext.downloads}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">v{ext.version}</span>
                    <button
                      onClick={() => toggleInstall(ext.id)}
                      className={`ml-auto text-xs px-2 py-0.5 rounded transition-colors ${
                        installed.has(ext.id)
                          ? "bg-muted text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                          : "bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
                      }`}
                      data-testid={`install-${ext.id}`}
                    >
                      {installed.has(ext.id) ? "Uninstall" : "Install"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
