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
- State persistence via localStorage (Zustand persist)

**Languages supported:** TypeScript, JavaScript, Python, CSS/SCSS, HTML, JSON, Markdown, SQL, Rust, Java, C++, PHP, XML

**Tech:**
- React + Vite
- Zustand (state management with localStorage persistence)
- CodeMirror 6 (editor engine)
- Tailwind CSS + shadcn/ui
- Lucide React icons

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
