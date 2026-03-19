# Document Editor - Project Guide

## Overview
A Google Docs-style collaborative document editor with real-time multi-user editing, rich text formatting, comments, version history, and document sharing.

## Tech Stack
- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Styling**: Tailwind CSS + Radix UI primitives
- **Editor**: Tiptap v2 (ProseMirror-based)
- **Real-time**: Yjs CRDT + Hocuspocus WebSocket server
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Auth**: Auth.js v5 (NextAuth v5) + Prisma adapter
- **Storage**: S3-compatible (AWS S3 / MinIO for dev)
- **State**: Zustand
- **Cache/PubSub**: Redis
- **Export**: Puppeteer (PDF), docx library (DOCX)
- **Testing**: Vitest (unit), Playwright (E2E), Testing Library (component)

## Architecture
- **Next.js app** serves the frontend and REST API routes
- **Hocuspocus server** runs as a separate Node.js process for WebSocket collaboration (Next.js serverless can't hold persistent connections)
- **Yjs CRDT** handles conflict-free collaborative editing with `y-indexeddb` for offline support
- **PostgreSQL** stores users, documents (Yjs binary state), permissions, comments, versions
- **Redis** handles Hocuspocus multi-instance pub-sub and caching
- **S3** stores uploaded images and exported files

## Project Structure
```
├── prisma/                     # Database schema and migrations
├── collab-server/              # Hocuspocus WebSocket server (separate process)
│   └── src/extensions/         # auth, persistence, webhook hooks
├── src/
│   ├── app/(auth)/             # Login, register pages
│   ├── app/(app)/              # Dashboard, documents/[id], settings, trash
│   ├── app/api/                # REST API routes
│   ├── components/editor/      # Tiptap editor, toolbar, extensions
│   ├── components/comments/    # Comment sidebar and threads
│   ├── components/documents/   # Document cards, share dialog, versions
│   ├── components/layout/      # Sidebar, topbar
│   ├── components/ui/          # Shared UI primitives
│   ├── lib/                    # Prisma client, S3, Redis, export, permissions
│   ├── stores/                 # Zustand stores
│   ├── hooks/                  # Custom React hooks
│   └── types/                  # TypeScript type definitions
├── docker-compose.yml          # PostgreSQL, Redis, MinIO, Hocuspocus
└── tests/                      # unit, integration, e2e
```

## Development Commands
```bash
npm run dev              # Start Next.js dev server
npm run collab           # Start Hocuspocus collaboration server
npm run db:migrate       # Run Prisma migrations
npm run db:seed          # Seed development data
npm run db:studio        # Open Prisma Studio
npm run build            # Production build
npm run test             # Run Vitest unit tests
npm run test:e2e         # Run Playwright E2E tests
npm run lint             # ESLint + TypeScript check
docker compose up -d     # Start PostgreSQL, Redis, MinIO
```

## Conventions
- TypeScript strict mode everywhere
- Tailwind CSS for all styling (no CSS modules)
- Prisma for all database access (no raw SQL)
- API routes use permission helpers from `src/lib/permissions.ts`
- Role hierarchy: VIEWER < COMMENTER < EDITOR < ADMIN (document owner = ADMIN)
- Collab auth via short-lived JWT tokens issued by Next.js, verified by Hocuspocus
- Yjs state stored as binary in PostgreSQL with incremental update table
- Comments stored in PostgreSQL (REST API), not in Yjs document

## Key Decisions
1. Hocuspocus runs as separate process (not embedded in Next.js)
2. Yjs binary stored in PostgreSQL (not a separate document DB)
3. JWT tokens for WebSocket auth (not cookies - different origin)
4. Comments via REST (queryable/pageable, independent of CRDT)
5. y-indexeddb for offline editing with auto-sync on reconnect

## Implementation Phases
1. Foundation & MVP (Next.js, auth, Tiptap editor, document CRUD)
2. Real-time Collaboration (Hocuspocus, Yjs, cursors)
3. Sharing & Permissions (roles, share dialog, email invites)
4. Comments & Suggestions (anchored comments, track changes)
5. Version History (snapshots, diff, restore)
6. Export & Media (PDF/DOCX, S3 images)
7. Offline & PWA (service worker, IndexedDB)
8. Polish & Testing (E2E, performance, CI/CD)
