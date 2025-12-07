# AGENTS.md - Codebase Guidelines

## Build & Dev Commands
- **Dev**: `pnpm dev` (runs Next.js dev server on port 3000)
- **Build**: `pnpm build`
- **Lint**: `pnpm lint`
- **Database**: `pnpm db:push` (applies Drizzle migrations)
- **Type check**: `pnpm tsc --noEmit`

## Architecture & Stack
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Database**: PostgreSQL + Drizzle ORM (migrations in `drizzle/`)
- **Auth**: Better Auth (email/password, sessions in cookies)
- **Real-time**: Server-Sent Events (SSE) at `/api/events/[boardId]`
- **UI**: shadcn/ui + Tailwind CSS 4 + Radix UI primitives
- **Drag-drop**: @hello-pangea/dnd (Kanban cards)
- **Notifications**: Sonner (toast)

## Project Structure
- `src/app/` - Next.js routes (auth, dashboard, public board, API)
- `src/components/` - Reusable UI & feature components
- `src/lib/` - Utilities, auth config, database client/schema
- `src/lib/db/schema.ts` - Drizzle schema (boards, columns, cards, auth tables)

## Code Style & Conventions
- **Imports**: Use `@/*` path alias (configured in tsconfig.json)
- **Client/Server**: Mark client components with `"use client"` at top
- **Exports**: Default exports for pages, named exports for components
- **Naming**: camelCase for functions/variables, PascalCase for components/types
- **Error handling**: Wrap fetches in try-catch, show errors via `toast.error()`
- **Formatting**: Prettier via ESLint (flat config in eslint.config.mjs)
- **Types**: Prefer inline interfaces in component files; use generics sparingly
- **Hooks**: Use React hooks (`useState`, `useEffect`); prefer client components

## Important Files
- `drizzle.config.ts` - Drizzle migration config
- `next.config.ts` - Next.js config
- `src/lib/auth.ts` - Better Auth server config
- `src/lib/auth-client.ts` - Better Auth client hooks (signIn, useSession, etc.)
- `.env` / `.env.local` - DATABASE_URL, BETTER_AUTH_SECRET, NEXT_PUBLIC_APP_URL

## Database Schema
Tables: `users`, `sessions`, `accounts`, `verifications` (Better Auth managed), plus app-specific:
- `boards` (uuid id, owner_id FK, name, shareCode unique, passwordHash)
- `columns` (uuid id, boardId FK, name, position)
- `cards` (uuid id, columnId FK, content, position, color)
