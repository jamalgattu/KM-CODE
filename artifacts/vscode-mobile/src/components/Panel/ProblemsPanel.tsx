import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";

export function ProblemsPanel() {
  const { problems, openFile } = useEditorStore();

  const errors = problems.filter((p) => p.severity === "error");
  const warnings = problems.filter((p) => p.severity === "warning");
  const infos = problems.filter((p) => p.severity === "info");

  return (
    <div className="flex flex-col h-full" data-testid="problems-panel">
      <div className="flex items-center gap-3 px-3 py-1 border-b border-border bg-background shrink-0">
        <span className="text-xs font-medium text-muted-foreground">PROBLEMS</span>
        <div className="flex items-center gap-2 text-xs">
          {errors.length > 0 && (
            <span className="flex items-center gap-1 text-destructive">
              <AlertCircle size={12} />
              {errors.length}
            </span>
          )}
          {warnings.length > 0 && (
            <span className="flex items-center gap-1 text-yellow-500">
              <AlertTriangle size={12} />
              {warnings.length}
            </span>
          )}
          {infos.length > 0 && (
            <span className="flex items-center gap-1 text-blue-400">
              <Info size={12} />
              {infos.length}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {problems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
            <CheckCircle2 size={32} className="text-green-500 opacity-50" />
            <span className="text-sm">No problems detected</span>
          </div>
        ) : (
          <div>
            {problems.map((problem) => (
              <div
                key={problem.id}
                className="flex items-start gap-2 px-3 py-1.5 hover:bg-sidebar-accent cursor-pointer"
                onClick={() => openFile(problem.fileId)}
                data-testid={`problem-${problem.id}`}
              >
                {problem.severity === "error" && (
                  <AlertCircle size={14} className="text-destructive mt-0.5 shrink-0" />
                )}
                {problem.severity === "warning" && (
                  <AlertTriangle size={14} className="text-yellow-500 mt-0.5 shrink-0" />
                )}
                {problem.severity === "info" && (
                  <Info size={14} className="text-blue-400 mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-foreground">{problem.message}</div>
                  <div className="text-xs text-muted-foreground">
                    {problem.fileName} [{problem.line},{problem.column}] · {problem.source}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
