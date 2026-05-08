import { useRef, useState } from "react";
import { Keyboard, Trash2, Plus, X, Play, Loader2, FlaskConical, ChevronRight } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";

type Mode = "single" | "cases";

export function InputPanel() {
  const {
    stdin, setStdin,
    testCases, activeTestCaseId,
    addTestCase, removeTestCase, updateTestCase, setActiveTestCase,
    runAllTestCases, isRunning,
  } = useEditorStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<Mode>("single");
  const [showExpected, setShowExpected] = useState(false);

  const activeCase = testCases.find((c) => c.id === activeTestCaseId) ?? testCases[0] ?? null;

  const lineCount = stdin ? stdin.split("\n").length : 0;
  const charCount = stdin.length;

  return (
    <div className="flex flex-col h-full bg-background" data-testid="input-panel">
      {/* Header */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border bg-background shrink-0">
        <Keyboard size={13} className="text-blue-400 shrink-0" />
        {/* Mode tabs */}
        <button
          onClick={() => setMode("single")}
          className={cn(
            "px-2 py-0.5 text-xs rounded transition-colors",
            mode === "single"
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Single
        </button>
        <button
          onClick={() => setMode("cases")}
          className={cn(
            "px-2 py-0.5 text-xs rounded transition-colors flex items-center gap-1",
            mode === "cases"
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <FlaskConical size={11} />
          Test Cases
          {testCases.length > 0 && (
            <span className={cn(
              "px-1 rounded-full text-[10px] font-bold",
              mode === "cases" ? "bg-primary text-primary-foreground" : "bg-muted-foreground/30 text-foreground"
            )}>
              {testCases.length}
            </span>
          )}
        </button>

        <div className="ml-auto flex items-center gap-1.5">
          {mode === "single" && stdin && (
            <span className="text-[10px] text-muted-foreground font-mono">
              {lineCount}L · {charCount}c
            </span>
          )}
          {mode === "single" && (
            <button
              onClick={() => setStdin("")}
              disabled={!stdin}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent disabled:opacity-30"
              title="Clear input"
            >
              <Trash2 size={13} />
            </button>
          )}
          {mode === "cases" && (
            <>
              <button
                onClick={addTestCase}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
                title="Add test case"
              >
                <Plus size={12} /> Add
              </button>
              <button
                onClick={runAllTestCases}
                disabled={isRunning || testCases.length === 0}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-green-600 text-white hover:bg-green-500 disabled:opacity-40 transition-colors"
                title="Run all test cases"
              >
                {isRunning
                  ? <Loader2 size={11} className="animate-spin" />
                  : <Play size={11} fill="white" />}
                Run All
              </button>
            </>
          )}
        </div>
      </div>

      {/* Single mode */}
      {mode === "single" && (
        <>
          <div className="flex-1 min-h-0 relative">
            <textarea
              ref={textareaRef}
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder={"Enter program input here...\n\nExample:\nJamal\n17\n\nEach line = one input() call in Python,\none Scanner.nextLine() in Java, etc."}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              className="absolute inset-0 w-full h-full resize-none bg-transparent font-mono text-xs text-foreground placeholder:text-muted-foreground/40 p-3 outline-none border-none focus:ring-0 panel-scroll"
            />
          </div>
          <div className="shrink-0 px-3 py-1.5 border-t border-border bg-muted/20">
            <p className="text-[10px] text-muted-foreground/50">
              Sent to your program on <kbd className="px-1 py-0.5 rounded bg-muted text-[10px]">Run</kbd> — works with <code className="text-[10px]">input()</code>, <code className="text-[10px]">scanf</code>, <code className="text-[10px]">Scanner</code>, <code className="text-[10px]">cin</code>
            </p>
          </div>
        </>
      )}

      {/* Test cases mode */}
      {mode === "cases" && (
        <div className="flex flex-col flex-1 min-h-0">
          {testCases.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
              <FlaskConical size={28} className="text-muted-foreground/40" />
              <div>
                <p className="text-sm text-muted-foreground font-medium">No test cases yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Add test cases to run your code against multiple inputs and expected outputs.</p>
              </div>
              <button
                onClick={addTestCase}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus size={13} /> Add First Test Case
              </button>
            </div>
          ) : (
            <>
              {/* Case tabs */}
              <div className="flex items-center gap-0.5 px-2 py-1 border-b border-border overflow-x-auto shrink-0">
                {testCases.map((tc) => (
                  <div key={tc.id} className="flex items-center shrink-0">
                    <button
                      onClick={() => setActiveTestCase(tc.id)}
                      className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors whitespace-nowrap",
                        activeCase?.id === tc.id
                          ? "bg-primary/15 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      {tc.label}
                      {tc.stdin.trim() && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                      )}
                    </button>
                    <button
                      onClick={() => removeTestCase(tc.id)}
                      className="p-0.5 rounded text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title={`Remove ${tc.label}`}
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>

              {activeCase && (
                <div className="flex flex-col flex-1 min-h-0">
                  {/* Case header + "Use as stdin" */}
                  <div className="flex items-center px-2 py-1 border-b border-border shrink-0 gap-2">
                    <span className="text-xs text-muted-foreground font-medium">{activeCase.label} — Input</span>
                    <button
                      onClick={() => setStdin(activeCase.stdin)}
                      className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
                      title="Copy to single stdin"
                    >
                      <ChevronRight size={11} /> Use as stdin
                    </button>
                  </div>

                  {/* Input textarea */}
                  <div className="relative flex-1 min-h-0" style={{ minHeight: "60px", maxHeight: showExpected ? "40%" : undefined }}>
                    <textarea
                      key={`stdin-${activeCase.id}`}
                      value={activeCase.stdin}
                      onChange={(e) => updateTestCase(activeCase.id, e.target.value)}
                      placeholder="stdin for this test case..."
                      spellCheck={false}
                      autoCapitalize="off"
                      autoCorrect="off"
                      className="absolute inset-0 w-full h-full resize-none bg-transparent font-mono text-xs text-foreground placeholder:text-muted-foreground/40 p-2.5 outline-none border-none focus:ring-0 panel-scroll"
                    />
                  </div>

                  {/* Expected output (collapsible) */}
                  <div className="shrink-0 border-t border-border">
                    <button
                      onClick={() => setShowExpected((v) => !v)}
                      className="w-full flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
                    >
                      <ChevronRight size={11} className={cn("transition-transform", showExpected && "rotate-90")} />
                      Expected Output
                      {activeCase.expectedOutput.trim() && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400" />
                      )}
                    </button>
                    {showExpected && (
                      <div className="relative" style={{ height: "80px" }}>
                        <textarea
                          key={`expected-${activeCase.id}`}
                          value={activeCase.expectedOutput}
                          onChange={(e) => updateTestCase(activeCase.id, activeCase.stdin, e.target.value)}
                          placeholder="Expected program output (optional)..."
                          spellCheck={false}
                          autoCapitalize="off"
                          className="absolute inset-0 w-full h-full resize-none bg-transparent font-mono text-xs text-foreground placeholder:text-muted-foreground/40 p-2.5 outline-none border-none focus:ring-0 panel-scroll border-t border-border"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
