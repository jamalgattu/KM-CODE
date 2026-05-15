import { useState, useRef, useEffect } from "react";
import { Bot, Send, Trash2, Settings, X, Copy, ExternalLink, Loader2, FileCode, ChevronDown } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { getCurrentEditorView } from "@/lib/editorView";
import { cn } from "@/lib/utils";

const AI_CONFIG_KEY = "szz-ai-config-v1";

interface AIConfig {
  provider: "groq" | "openai" | "custom";
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const PROVIDER_DEFAULTS: Record<string, { baseUrl: string; model: string; label: string }> = {
  groq:   { baseUrl: "https://api.groq.com/openai/v1", model: "llama-3.3-70b-versatile",    label: "Groq (Free)" },
  openai: { baseUrl: "https://api.openai.com/v1",       model: "gpt-4o-mini",                label: "OpenAI" },
  custom: { baseUrl: "",                                 model: "gpt-4o-mini",                label: "Custom" },
};

function loadConfig(): AIConfig | null {
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveConfig(cfg: AIConfig) {
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(cfg));
}

function renderContent(text: string) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const lines = part.slice(3).split("\n");
      const lang = lines[0].trim();
      const code = lines.slice(1).join("\n").replace(/```$/, "").trimEnd();
      return (
        <pre key={i} className="bg-muted/60 rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono border border-border/50">
          {lang && <div className="text-muted-foreground text-[10px] mb-1">{lang}</div>}
          <code>{code}</code>
        </pre>
      );
    }
    return (
      <span key={i} style={{ whiteSpace: "pre-wrap" }}>
        {part
          .split(/(`[^`]+`)/)
          .map((s, j) =>
            s.startsWith("`") && s.endsWith("`")
              ? <code key={j} className="bg-muted/60 rounded px-1 py-0.5 font-mono text-xs border border-border/50">{s.slice(1, -1)}</code>
              : <span key={j}>{s}</span>
          )}
      </span>
    );
  });
}

function SetupScreen({ onSave }: { onSave: (cfg: AIConfig) => void }) {
  const [provider, setProvider] = useState<"groq" | "openai" | "custom">("groq");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");

  const handleSave = () => {
    if (!apiKey.trim()) return;
    onSave({
      provider,
      apiKey: apiKey.trim(),
      baseUrl: provider === "custom" ? baseUrl.trim() : undefined,
      model: model.trim() || undefined,
    });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        <div className="flex flex-col items-center gap-2 pb-2">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Bot size={24} className="text-purple-400" />
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-foreground">AI Assistant</div>
            <div className="text-xs text-muted-foreground mt-0.5">Connect an AI API to chat about your code</div>
          </div>
        </div>

        {/* Provider selector */}
        <div>
          <div className="text-xs font-semibold text-foreground mb-2">Provider</div>
          <div className="flex gap-1">
            {(["groq", "openai", "custom"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setProvider(p)}
                className={cn(
                  "flex-1 py-1.5 text-xs rounded border transition-colors",
                  provider === p
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-sidebar-accent"
                )}
              >
                {PROVIDER_DEFAULTS[p].label}
              </button>
            ))}
          </div>
        </div>

        {/* Groq instructions */}
        {provider === "groq" && (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
            <div className="font-medium text-foreground">Get a free Groq key in 2 minutes:</div>
            <div>1. Visit <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">console.groq.com</a></div>
            <div>2. Sign up (free, no credit card)</div>
            <div>3. Create an API key → paste below</div>
            <div className="text-green-400 mt-1">✓ 14,400 free requests/day</div>
          </div>
        )}

        {/* API Key input */}
        <div>
          <div className="text-xs font-semibold text-foreground mb-1">API Key</div>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={provider === "groq" ? "gsk_..." : provider === "openai" ? "sk-..." : "Your API key"}
            className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
        </div>

        {/* Custom endpoint */}
        {provider === "custom" && (
          <div>
            <div className="text-xs font-semibold text-foreground mb-1">Base URL</div>
            <input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.example.com/v1"
              className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
        )}

        {/* Model override */}
        <div>
          <div className="text-xs font-semibold text-foreground mb-1">
            Model <span className="font-normal text-muted-foreground">(optional, uses default if empty)</span>
          </div>
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder={PROVIDER_DEFAULTS[provider].model}
            className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!apiKey.trim()}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Connect AI
        </button>

        <p className="text-xs text-muted-foreground text-center">
          Your API key is stored locally on your device only
        </p>
      </div>
    </div>
  );
}

export function AIChatPanel() {
  const [config, setConfig] = useState<AIConfig | null>(() => loadConfig());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useContext, setUseContext] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { openTabs, activeTabId, files } = useEditorStore();

  const activeTab = openTabs.find((t) => t.id === activeTabId);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const getFileContent = (): string => {
    const findContent = (nodes: typeof files): string | null => {
      for (const node of nodes) {
        if (node.id === activeTab?.fileId) return node.content ?? "";
        if (node.children) {
          const f = findContent(node.children);
          if (f !== null) return f;
        }
      }
      return null;
    };
    const liveView = getCurrentEditorView();
    if (liveView) return liveView.state.doc.toString();
    return findContent(files) ?? "";
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !config) return;
    const userMsg = input.trim();
    setInput("");
    setError(null);

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const { baseUrl, model } = {
        baseUrl: config.provider === "custom" ? (config.baseUrl ?? "") : PROVIDER_DEFAULTS[config.provider].baseUrl,
        model: config.model || PROVIDER_DEFAULTS[config.provider].model,
      };

      const systemContent = useContext && activeTab
        ? `You are a helpful coding assistant for Su Zai Zai Code (mobile code editor). Be concise and format code in markdown.\n\nCurrent file: ${activeTab.fileName} (${activeTab.language})\n\`\`\`${activeTab.language}\n${getFileContent().slice(0, 3000)}\n\`\`\``
        : "You are a helpful coding assistant for Su Zai Zai Code (mobile code editor). Be concise and format code in markdown.";

      const resp = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemContent },
            ...newMessages.map((m) => ({ role: m.role, content: m.content })),
          ],
          max_tokens: 1024,
          temperature: 0.3,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: { message: resp.statusText } }));
        throw new Error(err.error?.message ?? `API error ${resp.status}`);
      }

      const data = await resp.json();
      const reply = data.choices?.[0]?.message?.content ?? "No response";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setMessages(newMessages);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content).catch(() => {});
    setCopied(content);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleSaveConfig = (cfg: AIConfig) => {
    saveConfig(cfg);
    setConfig(cfg);
    setShowSettings(false);
  };

  if (!config || showSettings) {
    return (
      <div className="flex flex-col h-full">
        {showSettings && (
          <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">AI Settings</span>
            <button onClick={() => setShowSettings(false)} className="p-1 rounded text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          </div>
        )}
        <SetupScreen onSave={handleSaveConfig} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-muted/20 shrink-0">
        <Bot size={13} className="text-purple-400 shrink-0" />
        <span className="text-xs text-muted-foreground flex-1 truncate">
          {config.model || PROVIDER_DEFAULTS[config.provider].model} · {PROVIDER_DEFAULTS[config.provider].label}
        </span>
        <button
          onClick={() => setUseContext((v) => !v)}
          className={cn(
            "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border transition-colors",
            useContext
              ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
          title={useContext ? "File context: ON" : "File context: OFF"}
        >
          <FileCode size={11} />
          <span className="hidden sm:inline">Context</span>
        </button>
        <button
          onClick={() => setMessages([])}
          className="p-1 rounded text-muted-foreground hover:text-foreground"
          title="Clear chat"
        >
          <Trash2 size={13} />
        </button>
        <button
          onClick={() => setShowSettings(true)}
          className="p-1 rounded text-muted-foreground hover:text-foreground"
          title="Change AI settings"
        >
          <Settings size={13} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground select-none">
            <Bot size={28} className="text-purple-400/50" />
            <div className="text-center">
              <div className="text-xs font-medium text-foreground/60">AI is ready</div>
              <div className="text-xs text-muted-foreground/60 mt-0.5">
                {activeTab ? `Ask about ${activeTab.fileName}` : "Ask anything about coding"}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center mt-1 max-w-xs">
              {["Explain this code", "Find bugs", "Suggest improvements", "Add comments"].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); textareaRef.current?.focus(); }}
                  className="px-2 py-1 text-xs rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={12} className="text-purple-400" />
                </div>
              )}
              <div className={cn(
                "max-w-[85%] rounded-xl px-3 py-2 text-sm relative group",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted/60 text-foreground border border-border/50 rounded-bl-sm"
              )}>
                <div className="prose-sm leading-relaxed">
                  {renderContent(msg.content)}
                </div>
                {msg.role === "assistant" && (
                  <button
                    onClick={() => handleCopy(msg.content)}
                    className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-0.5 rounded text-muted-foreground hover:text-foreground transition-opacity"
                    title="Copy"
                  >
                    {copied === msg.content
                      ? <span className="text-[10px] text-green-400 font-mono">✓</span>
                      : <Copy size={11} />}
                  </button>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-primary">U</span>
                </div>
              )}
            </div>
          ))
        )}
        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
              <Bot size={12} className="text-purple-400" />
            </div>
            <div className="bg-muted/60 border border-border/50 rounded-xl rounded-bl-sm px-3 py-2">
              <Loader2 size={14} className="animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive">
            <span className="shrink-0 mt-0.5">⚠</span>
            <span>{error}</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-1.5 border-t border-border shrink-0">
        {useContext && activeTab && (
          <div className="flex items-center gap-1.5 mb-1.5 text-xs text-muted-foreground">
            <FileCode size={11} />
            <span className="truncate">Context: {activeTab.fileName}</span>
          </div>
        )}
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your code... (Enter to send, Shift+Enter for newline)"
            rows={1}
            className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none overflow-hidden min-h-[36px]"
            style={{ height: "36px" }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
            title="Send (Enter)"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}
