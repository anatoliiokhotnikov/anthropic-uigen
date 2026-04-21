# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Initial setup (install deps + generate Prisma + run migrations)
npm run setup

# Development (Next.js with Turbopack)
npm run dev

# Build & production
npm run build
npm run start

# Lint
npm run lint

# Tests (Vitest)
npm run test

# Reset SQLite database
npm run db:reset
```

To run a single test file:
```bash
npx vitest run src/lib/__tests__/file-system.test.ts
```

## Architecture

UIGen is a Next.js 15 (App Router) application that lets users describe React components in natural language and generates them live using Claude AI.

### Key architectural layers

**AI integration** — `src/app/api/chat/route.ts` is the core. It calls `streamText()` from Vercel AI SDK with two tools available to Claude:
- `str_replace_editor`: Edit file contents (string replacement)
- `file_manager`: Create/delete files

The model is `claude-haiku-4-5` with prompt caching enabled. Falls back to a mock provider when `ANTHROPIC_API_KEY` is absent.

**Virtual file system** — `src/lib/file-system.ts` implements an in-memory, serializable file system. It is not backed by disk. State lives in `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`) and is persisted to SQLite via Prisma as a JSON blob on the `Project.data` field.

**Component preview** — `src/components/preview/PreviewFrame.tsx` renders generated code in an iframe. `src/lib/transform/jsx-transformer.ts` uses `@babel/standalone` to transpile JSX and rewrites imports to CDN URLs (esm.sh), so React 19 and other libraries load from CDN at runtime without bundling.

**State management** — Two React contexts coordinate the UI:
- `FileSystemContext`: Virtual FS state + file operations
- `ChatContext` (`src/lib/contexts/chat-context.tsx`): Wraps AI SDK's `useChat`, applies tool call results to the file system, and persists messages + FS to Prisma

**Auth** — JWT-based with httpOnly cookies (7-day expiry), implemented with `jose`. Anonymous users can use the app without logging in; projects are then ephemeral. Middleware (`src/middleware.ts`) protects `/api/projects` and `/api/filesystem`.

**Server actions** — `src/actions/` contains typed Next.js server actions for auth (signup/login/logout) and project CRUD.

### Data model (Prisma + SQLite)

```
User     { id, email, password, projects[] }
Project  { id, name, userId?, messages (JSON), data (JSON), timestamps }
```

`messages` stores the full chat history array; `data` stores the serialized virtual file system.

### Path alias

`@/` maps to `src/` throughout the codebase (configured in `tsconfig.json` and `vitest.config.mts`).

### Testing

Tests use Vitest with jsdom + Testing Library. Test files are colocated in `__tests__/` folders next to the code they test. The main tested areas are chat components, editor components, file system context, chat context, and the JSX transformer.
