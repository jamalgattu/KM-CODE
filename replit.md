# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Code Editor (`artifacts/vscode-mobile`) - Preview Path: `/`

A fully-functional VS Code-like code editor optimized for mobile browsers.

**Features:**
- Full code editor powered by **CodeMirror 6** with syntax highlighting
- File Explorer with create/rename/delete operations
- Multi-tab editing with unsaved indicators
- Terminal emulator with command execution (help, ls, git, npm, node, etc.)
- Search across all files with match highlighting
- Git panel with staged/unstaged changes view
- Extensions panel with install/uninstall
- Settings panel: theme, font size, tab size, word wrap, minimap, line numbers, auto-save
- Dual theme (VS Code Dark+ and Light)
- Status bar with git branch, error/warning counts, language, auto-save indicator
- Menu bar: File, Edit, View, Run with keyboard shortcuts
- Keyboard shortcuts: ⌘S (save), ⌘B (sidebar), ⌘` (terminal), ⌘⇧F (search), ⌘⇧E (explorer)
- Drag-to-resize bottom panel (Terminal/Problems/Output)
- State persistence via localStorage (Zustand persist) + real backend sync
- **Real code execution** via ▶ Run button (JavaScript, TypeScript, Python, Bash)
- **Real terminal** — shell commands execute on the server
- **File persistence** — files stored in PostgreSQL, loaded from DB on startup

**Languages supported:** TypeScript, JavaScript, Python, CSS/SCSS, HTML, JSON, Markdown, SQL, Rust, Java, C++, PHP, XML

**Tech:**
- React + Vite
- Zustand (state management with localStorage + PostgreSQL persistence)
- CodeMirror 6 (editor engine)
- Tailwind CSS + shadcn/ui
- Lucide React icons
- `@workspace/api-client-react` — React Query hooks auto-generated from OpenAPI spec

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `curl -s -X POST http://localhost:8080/api/seed` — seed database with default project files (skips if already seeded)

## API Endpoints

- `GET /api/files` — list all files
- `POST /api/files` — create file or folder
- `GET /api/files/:id` — get file by ID
- `PUT /api/files/:id` — update file content/name
- `DELETE /api/files/:id` — delete file or folder (cascades children)
- `POST /api/execute` — execute code (JS/TS/Python/Bash) and return stdout/stderr
- `POST /api/terminal` — run a shell command and return output
- `POST /api/seed` — seed DB with default project files (idempotent)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
