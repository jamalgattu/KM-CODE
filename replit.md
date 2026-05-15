# Su Zai Zai Code

A free mobile-first code editor PWA. Write, run, and sync code from any browser or phone.

## Run & Operate

- `pnpm --filter @workspace/vscode-mobile run dev` — run the frontend (port 3000)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS
- Editor: CodeMirror 6 with @codemirror/legacy-modes
- State: Zustand (persisted to localStorage)
- Auth: Supabase (optional cloud sync)
- Runtime: Judge0 (free public API for code execution)

## Where things live

- `artifacts/vscode-mobile/src/` — all frontend source
  - `components/` — UI components
  - `store/editorStore.ts` — all app state (Zustand)
  - `lib/editorThemes.ts` — 9 CM6 theme definitions
  - `types/editor.ts` — TypeScript interfaces
- `artifacts/api-server/` — Express API (sync, not required for guest mode)

## Architecture decisions

- **No backend required for core features** — code execution via Judge0, storage via localStorage
- **Theme system** — `theme: string` in store; `DARK_THEME_IDS` set controls Tailwind dark class
- **Legacy modes** — `@codemirror/legacy-modes` wraps CM5 modes for Go, Shell, Ruby, Kotlin, Swift, YAML
- **AI chat** — purely client-side; API key stored in `szz-ai-config-v1` localStorage key; no backend proxy
- **Snippets** — CM6 `snippetCompletion` via `autocompletion({ override: [...] })` per language

## Product

Su Zai Zai Code is a mobile-optimized IDE with:
- 15 languages with syntax highlighting
- 9 color themes (dark + light)
- Code execution via Judge0
- AI assistant (Groq/OpenAI/custom, key stored locally)
- Command palette (Ctrl+Shift+P / mobile button)
- Language-specific code snippets in autocomplete
- Find & Replace (CM6 native search panel)
- HTML/Markdown live preview
- Mobile symbol bar for fast symbol insertion
- Pinch-to-zoom font resizing
- Optional Supabase cloud sync

## User preferences

- Keep UI minimal and mobile-first
- All new icons must be verified to exist in the installed version of lucide-react before using

## Gotchas

- `Fold` icon does NOT exist in lucide-react — use `ChevronsUpDown` instead
- `theme: string` (not `"dark"|"light"`) — use `DARK_THEME_IDS.has(theme)` for Tailwind dark class checks
- `activePanel` type includes `"ai"` — always cast with `as never` or import the correct type
- `@codemirror/legacy-modes` mode imports follow `mode/go`, `mode/shell`, `mode/clike` (kotlin), etc.
- AI chat is pure client-side — no server API key, users bring their own (Groq is free)

## Pointers

- See `pnpm-workspace` skill for workspace structure
- Theme definitions: `artifacts/vscode-mobile/src/lib/editorThemes.ts`
- Snippet definitions: inside `artifacts/vscode-mobile/src/components/Editor/CodeEditor.tsx`
