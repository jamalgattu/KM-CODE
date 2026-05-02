import { useState, useEffect } from "react";
import { Search, X, CaseSensitive, Regex, FileText } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";

export function SearchPanel() {
  const { searchQuery, setSearchQuery, searchResults, searchInFiles, openFile } = useEditorStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchInFiles(localQuery, { caseSensitive, useRegex });
      setSearchQuery(localQuery);
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localQuery, caseSensitive, useRegex]);

  const totalMatches = searchResults.reduce((acc, r) => acc + r.matches.length, 0);

  return (
    <div className="flex flex-col h-full" data-testid="search-panel">
      <div className="flex items-center justify-between px-3 py-2 border-b border-sidebar-border">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Search
        </span>
      </div>

      <div className="px-2 py-2">
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-2.5 text-muted-foreground" />
          <input
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search in files..."
            className="w-full bg-input border border-border rounded text-sm pl-8 pr-16 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            data-testid="search-input"
          />
          <div className="absolute right-1 flex items-center gap-0.5">
            <button
              onClick={() => setCaseSensitive(!caseSensitive)}
              className={cn(
                "p-1 rounded text-xs",
                caseSensitive ? "text-primary bg-primary/20" : "text-muted-foreground hover:text-foreground"
              )}
              title="Match Case"
            >
              <CaseSensitive size={14} />
            </button>
            <button
              onClick={() => setUseRegex(!useRegex)}
              className={cn(
                "p-1 rounded text-xs",
                useRegex ? "text-primary bg-primary/20" : "text-muted-foreground hover:text-foreground"
              )}
              title="Use Regular Expression"
            >
              <Regex size={14} />
            </button>
            {localQuery && (
              <button
                onClick={() => setLocalQuery("")}
                className="p-1 rounded text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {localQuery && (
          <div className="mt-1 text-xs text-muted-foreground">
            {totalMatches > 0
              ? `${totalMatches} result${totalMatches !== 1 ? "s" : ""} in ${searchResults.length} file${searchResults.length !== 1 ? "s" : ""}`
              : "No results found"}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto explorer-scroll">
        {searchResults.map((result) => (
          <div key={result.fileId}>
            <div
              className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-sidebar-foreground cursor-pointer hover:bg-sidebar-accent"
              onClick={() => openFile(result.fileId)}
              data-testid={`search-result-file-${result.fileId}`}
            >
              <FileText size={13} className="text-muted-foreground shrink-0" />
              <span className="truncate font-medium">{result.fileName}</span>
              <span className="ml-auto text-muted-foreground shrink-0">
                {result.matches.length}
              </span>
            </div>
            {result.matches.slice(0, 5).map((match, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 px-3 py-0.5 cursor-pointer hover:bg-sidebar-accent/60"
                onClick={() => openFile(result.fileId)}
                data-testid={`search-match-${result.fileId}-${idx}`}
              >
                <span className="text-xs text-muted-foreground shrink-0 w-6 text-right mt-0.5">
                  {match.line}
                </span>
                <span className="text-xs text-foreground/80 truncate font-mono">
                  {highlightMatch(match.preview, localQuery)}
                </span>
              </div>
            ))}
            {result.matches.length > 5 && (
              <div className="px-3 py-0.5 text-xs text-muted-foreground italic">
                +{result.matches.length - 5} more matches
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function highlightMatch(text: string, query: string) {
  if (!query) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <>
      <span>{text.substring(0, idx)}</span>
      <span className="bg-yellow-400/40 text-foreground">
        {text.substring(idx, idx + query.length)}
      </span>
      <span>{text.substring(idx + query.length)}</span>
    </>
  );
}
