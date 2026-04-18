# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio and gaming platform for Taha Rawjani. Built with Next.js 16 / React 19 / TypeScript, styled with a retro 90s OS aesthetic (VT323 font, deep purple palette). Features a blog, multiplayer poker game, Claude AI terminal, and Codeforces practice tool.

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint (next lint)
npm run start    # Start production server
```

There are no tests. Linting is the only automated code quality check.

## Architecture

### Routing & Pages (`/app`)

Next.js App Router. All pages under `/app` are server components by default; interactive pages (`"use client"`) fetch data client-side.

- `/app/page.tsx` — Home: animated CPU/memory visualizers, experience timeline, tab-switch to Terminal
- `/app/blog/` — Markdown blog reader (hardcoded metadata list, files in `/public/blogs/`)
- `/app/games/` — Game hub; sub-routes for poker and Codeforces practice
- `/app/api/` — API routes (no external server)

### API Routes (`/app/api`)

| Route | Purpose |
|---|---|
| `POST /api/terminal` | Claude AI chat; session auth via `TERMINAL_PASSWORD`, sessions stored in-memory |
| `POST /api/poker/*` | Poker game CRUD (create, join, action, state, poll) |
| `GET /api/codeforces` | Proxy to Codeforces API with 5-min cache |
| `POST /api/admin/*` | Blog management; requires Supabase service role |

### Game Logic (`/lib/poker`)

Pure functional poker engine — no side effects, deep copies via `JSON.parse(JSON.stringify(...))`.

- `engine.ts` — Full Texas Hold'em state machine (phases: preflop → flop → turn → river → showdown), side pot calculation, player action validation
- `evaluator.ts` — Hand ranking (high card → royal flush) with 5-of-7 best hand extraction
- `types.ts` — `GameState`, `Player`, `Action` type definitions
- `sanitize.ts` — Input validation for API payloads

Game state is persisted in Supabase (`poker_rooms` table); the engine runs server-side on each action.

### Database (`/lib/supabase`)

Supabase (PostgreSQL + Storage). Three client variants:

- `client.ts` — Browser client
- `server.ts` — Server component / API route client (cookie-based auth)
- `admin.ts` — Service-role client for privileged ops (blog creation)
- `proxy.ts` — Middleware for refreshing auth sessions

Tables: `poker_rooms`, `blogs`. Storage bucket: `blogs` (Markdown files).

### Styling Conventions

Tailwind CSS 4 with a custom retro theme defined in `tailwind.config.ts`:
- Background: deep purple (`#2d1b69`)
- Accents: violet/purple gradient sidebars, shadow-based depth
- Font: VT323 monospace throughout
- UI pattern: "window" containers with title bars, tabs, and inset shadows

Use `cn()` from `@/lib/utils` (wraps `clsx` + `tailwind-merge`) for conditional class names.

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY     # admin blog operations
ANTHROPIC_API_KEY             # Claude terminal
TERMINAL_PASSWORD             # terminal auth gate
```

### Path Aliases

`@/*` maps to the project root (configured in `tsconfig.json`).
