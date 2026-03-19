# Document Editor - Full Architecture Plan

## 1. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js 14+ (App Router, TypeScript) | SSR, API routes, React Server Components |
| Styling | Tailwind CSS + Radix UI | Utility-first CSS + accessible headless components |
| Editor | Tiptap v2 (ProseMirror-based) | Mature extension ecosystem, first-class Yjs integration |
| Real-time CRDT | Yjs + HocuspocusProvider | Conflict-free merging, offline-capable, binary-efficient |
| Collab Server | Hocuspocus (separate Node.js process) | Purpose-built Yjs WebSocket server with auth/persistence hooks |
| Database | PostgreSQL 15+ with Prisma ORM | Relational integrity, type-safe queries |
| Auth | Auth.js v5 + @auth/prisma-adapter | JWT sessions, OAuth (Google/GitHub), magic links |
| Storage | S3-compatible (AWS S3 / MinIO for dev) | Images, media, exported files |
| State | Zustand | Lightweight, works outside React tree |
| Cache/PubSub | Redis | Hocuspocus scaling, session cache, rate limiting |
| Export | Puppeteer (PDF), docx library (DOCX) | Server-side rendering for consistency |
| Testing | Vitest (unit), Playwright (E2E), Testing Library | Fast unit tests, real browser E2E |

---

## 2. Project Structure

```
document-editor/
├── .env.local                          # Local environment variables
├── .env.example                        # Template for env vars
├── docker-compose.yml                  # PostgreSQL, Redis, MinIO, Hocuspocus
├── Dockerfile                          # Next.js production build
├── Dockerfile.collab                   # Hocuspocus server build
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── vitest.config.ts
├── playwright.config.ts
│
├── prisma/
│   ├── schema.prisma                   # Full database schema
│   ├── migrations/                     # Migration history
│   └── seed.ts                         # Development seed data
│
├── collab-server/                      # Hocuspocus process (separate entry)
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                    # Server bootstrap
│       ├── extensions/
│       │   ├── postgres-persistence.ts # Load/store Yjs docs in PostgreSQL
│       │   ├── auth.ts                 # JWT verification on connect
│       │   ├── webhook.ts              # Notify Next.js on document events
│       │   └── metrics.ts              # Connection/document metrics
│       └── utils/
│           ├── prisma.ts               # Shared Prisma client
│           └── redis.ts                # Redis client for pub-sub
│
├── src/
│   ├── auth.ts                         # Auth.js v5 config
│   ├── auth.config.ts                  # Edge-compatible auth config
│   ├── middleware.ts                   # Route protection
│   │
│   ├── app/
│   │   ├── layout.tsx                  # Root layout
│   │   ├── page.tsx                    # Landing / dashboard redirect
│   │   ├── globals.css                 # Tailwind directives
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── layout.tsx              # Centered card layout
│   │   │
│   │   ├── (app)/                      # Authenticated shell
│   │   │   ├── layout.tsx              # Sidebar, topbar, providers
│   │   │   ├── dashboard/page.tsx      # Document list
│   │   │   ├── documents/
│   │   │   │   ├── [id]/page.tsx       # Editor page
│   │   │   │   └── new/page.tsx        # Create + redirect
│   │   │   ├── settings/page.tsx
│   │   │   └── trash/page.tsx
│   │   │
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── documents/
│   │       │   ├── route.ts            # GET (list), POST (create)
│   │       │   └── [id]/
│   │       │       ├── route.ts        # GET, PATCH, DELETE
│   │       │       ├── share/route.ts
│   │       │       ├── versions/route.ts
│   │       │       ├── comments/route.ts
│   │       │       ├── export/route.ts
│   │       │       └── collab-token/route.ts
│   │       ├── comments/[id]/route.ts
│   │       ├── media/
│   │       │   ├── upload/route.ts
│   │       │   └── [key]/route.ts
│   │       └── users/search/route.ts
│   │
│   ├── components/
│   │   ├── editor/
│   │   │   ├── Editor.tsx              # Main Tiptap wrapper
│   │   │   ├── EditorToolbar.tsx       # Formatting toolbar
│   │   │   ├── BubbleMenu.tsx          # Floating toolbar on selection
│   │   │   ├── CollaborationCursors.tsx
│   │   │   ├── TableMenu.tsx
│   │   │   ├── ImageBlock.tsx
│   │   │   ├── LinkBubble.tsx
│   │   │   └── extensions/
│   │   │       ├── index.ts            # Aggregated extensions
│   │   │       ├── collaboration.ts    # Yjs provider + cursor setup
│   │   │       ├── image.ts            # Custom image (S3 upload)
│   │   │       ├── comment.ts          # Inline comment mark
│   │   │       ├── suggestion.ts       # Track changes
│   │   │       └── slash-command.ts    # "/" command palette
│   │   │
│   │   ├── comments/
│   │   │   ├── CommentsSidebar.tsx
│   │   │   ├── CommentThread.tsx
│   │   │   └── CommentInput.tsx
│   │   │
│   │   ├── documents/
│   │   │   ├── DocumentCard.tsx
│   │   │   ├── DocumentList.tsx
│   │   │   ├── ShareDialog.tsx
│   │   │   ├── VersionHistory.tsx
│   │   │   └── ExportMenu.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── UserMenu.tsx
│   │   │   └── SearchCommand.tsx       # Cmd+K search
│   │   │
│   │   └── ui/                         # Shared primitives
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── skeleton.tsx
│   │       ├── toast.tsx
│   │       └── avatar.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts                   # Prisma client singleton
│   │   ├── s3.ts                       # S3 client + presigned URLs
│   │   ├── redis.ts                    # Redis client
│   │   ├── permissions.ts              # Role-based permission checks
│   │   ├── utils.ts                    # Shared helpers
│   │   ├── export/
│   │   │   ├── pdf.ts                  # HTML -> PDF via Puppeteer
│   │   │   └── docx.ts                 # JSON -> DOCX
│   │   └── collab/
│   │       ├── provider.ts             # HocuspocusProvider factory
│   │       └── token.ts               # JWT for collab auth
│   │
│   ├── stores/
│   │   ├── editor-store.ts             # Active document, editor state
│   │   ├── ui-store.ts                 # Sidebar, theme, modals
│   │   └── presence-store.ts           # Online collaborators
│   │
│   ├── hooks/
│   │   ├── use-editor.ts              # Tiptap initialization
│   │   ├── use-collaboration.ts       # HocuspocusProvider connection
│   │   ├── use-document.ts            # Document CRUD
│   │   ├── use-comments.ts            # Comment operations
│   │   ├── use-permissions.ts         # Current user's role
│   │   └── use-offline.ts            # Service worker + sync
│   │
│   ├── types/
│   │   ├── document.ts
│   │   ├── comment.ts
│   │   ├── editor.ts
│   │   └── api.ts
│   │
│   └── workers/
│       └── sw.ts                       # Service worker
│
├── public/
│   ├── manifest.json
│   └── icons/
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## 3. Database Schema

### Models

#### User (Auth.js required)
- id, name, email (unique), emailVerified, image
- Relations: accounts, sessions, ownedDocuments, permissions, comments

#### Account (Auth.js)
- userId, type, provider, providerAccountId, tokens

#### Session (Auth.js)
- sessionToken, userId, expires

#### Document
- id, title, ownerId
- yjsState (Bytes) - merged CRDT binary
- contentHtml (Text) - HTML snapshot for search/preview
- wordCount, coverImage, isTemplate
- deletedAt (soft delete)
- Relations: permissions, versions, comments, yjsUpdates

#### YjsUpdate
- id (BigInt auto-increment), documentId
- update (Bytes) - individual Yjs binary update
- Periodically merged into Document.yjsState and pruned

#### DocumentVersion
- id, documentId, yjsSnapshot (Bytes)
- title, createdById, label (optional)

#### DocumentPermission
- documentId + userId (unique compound)
- role: VIEWER | COMMENTER | EDITOR | ADMIN

#### Comment
- id, documentId, authorId
- parentId (threading)
- content, anchorText, anchorFrom, anchorTo
- resolved, resolvedAt, resolvedBy
- isSuggestion, suggestedText
- Relations: replies, reactions

#### CommentReaction
- commentId + userId + emoji (unique compound)

---

## 4. API Routes

| Method | Route | Description | Min Role |
|--------|-------|-------------|----------|
| GET | /api/documents | List user's docs (owned + shared) | Auth |
| POST | /api/documents | Create new document | Auth |
| GET | /api/documents/[id] | Get doc metadata + content | VIEWER |
| PATCH | /api/documents/[id] | Update title, cover, trash | EDITOR |
| DELETE | /api/documents/[id] | Hard delete | Owner |
| GET | /api/documents/[id]/collab-token | Issue JWT for Hocuspocus | VIEWER |
| POST | /api/documents/[id]/share | Add collaborator | ADMIN |
| GET | /api/documents/[id]/share | List collaborators | VIEWER |
| DELETE | /api/documents/[id]/share | Remove collaborator | ADMIN |
| PATCH | /api/documents/[id]/share | Update role | ADMIN |
| GET | /api/documents/[id]/versions | List snapshots | VIEWER |
| POST | /api/documents/[id]/versions | Create snapshot | EDITOR |
| POST | /api/documents/[id]/versions/[vid]/restore | Restore version | EDITOR |
| GET | /api/documents/[id]/comments | List comments | VIEWER |
| POST | /api/documents/[id]/comments | Create comment | COMMENTER |
| PATCH | /api/comments/[id] | Edit/resolve comment | Author/ADMIN |
| DELETE | /api/comments/[id] | Delete comment | Author/ADMIN |
| POST | /api/documents/[id]/export | Export PDF/DOCX | VIEWER |
| POST | /api/media/upload | Get presigned S3 URL | Auth |
| GET | /api/media/[key] | Redirect to S3 | Permission |
| GET | /api/users/search | Search users for sharing | Auth |

---

## 5. Core Module Details

### Editor Engine
- Tiptap v2 with StarterKit + collaboration extensions
- Custom extensions: comment mark, suggestion/track-changes, slash command, image (S3)
- HocuspocusProvider connects to WebSocket server
- y-indexeddb for offline local persistence

### Collaboration Server (Hocuspocus)
- Separate Node.js process (required for WebSocket persistence)
- Auth hook: verify JWT, check document permission
- Persistence hook: load/store Yjs state in PostgreSQL
- Redis extension for multi-instance scaling
- Webhook hook: notify Next.js on document events

### Permission System
- Role hierarchy: VIEWER < COMMENTER < EDITOR < ADMIN
- Document owner = implicit ADMIN
- Permission check helper used by all API routes and Hocuspocus auth
- Collab token: short-lived JWT with { userId, documentId, role }

### Export Service
- PDF: Render Tiptap HTML in Puppeteer, page.pdf() with A4 dimensions
- DOCX: Walk Tiptap JSON tree, map to docx library objects
- Upload result to S3, return presigned download URL

---

## 6. Implementation Phases

### Phase 1: Foundation & MVP (Weeks 1-3)
- Next.js 14 + TypeScript + Tailwind + App Router setup
- PostgreSQL + Prisma schema (User, Document models)
- Auth.js v5 with Google OAuth
- Auth pages, middleware, route protection
- Document CRUD API routes
- Dashboard page with document list
- Tiptap v2 with standard extensions (no collab yet)
- Manual save to database
- Basic responsive layout

### Phase 2: Real-Time Collaboration (Weeks 4-6)
- Hocuspocus server setup in collab-server/
- PostgreSQL persistence extension for Yjs
- Auth extension (JWT verification)
- Yjs + HocuspocusProvider in Tiptap editor
- Collaboration cursor extension
- Collab-token API endpoint
- Docker Compose (PostgreSQL, Redis, Hocuspocus)
- Presence indicators (active editor avatars)

### Phase 3: Sharing & Permissions (Weeks 7-8)
- DocumentPermission model + migration
- Share API routes (invite, list, update, remove)
- ShareDialog with user search autocomplete
- Permission enforcement in API + Hocuspocus
- "Shared with me" dashboard section
- Read-only mode for VIEWERs
- Email notifications for invitations

### Phase 4: Comments & Suggestions (Weeks 9-10)
- Comment mark Tiptap extension
- Comment API routes (CRUD, resolve)
- CommentsSidebar, CommentThread components
- Suggestion mode (track changes extension)
- Accept/reject suggestion flow
- Comment reactions

### Phase 5: Version History (Weeks 11-12)
- DocumentVersion model + migration
- Auto-snapshot on intervals/events
- Version list UI
- Diff view between versions
- Restore to version
- Undo/redo via Yjs UndoManager

### Phase 6: Export & Media (Weeks 13-14)
- S3 setup (MinIO for dev)
- Presigned upload URL endpoint
- Custom Tiptap image extension with drag-and-drop
- Image resizing controls
- PDF export via Puppeteer
- DOCX export via docx library
- ExportMenu component

### Phase 7: Offline & PWA (Weeks 15-16)
- y-indexeddb for local Yjs persistence
- Service worker for app shell caching
- Offline indicator UI
- Queue offline actions for sync
- PWA manifest + installability
- Reconnection sync UX

### Phase 8: Polish & Testing (Weeks 17-18)
- Playwright E2E test suite
- Vitest unit tests for core logic
- Performance optimization (virtualization, lazy loading)
- Accessibility audit
- Error boundaries
- Rate limiting
- CI/CD pipeline (GitHub Actions)

---

## 7. Key Architectural Decisions

1. **Separate Hocuspocus process**: Next.js serverless cannot hold WebSocket connections. Two services in production: Next.js app + Hocuspocus server.

2. **Yjs binary in PostgreSQL**: Simpler than adding MongoDB. Incremental YjsUpdate table + periodic merge into Document.yjsState balances write performance with storage.

3. **JWT for collab auth**: Hocuspocus runs on different port/domain, so browser cookies don't apply. Short-lived JWT (5min, auto-refresh) is the cleanest approach.

4. **Comments via REST**: Keeping comments in PostgreSQL (not Yjs) makes them queryable, pageable, and independent of CRDT merge logic.

5. **Puppeteer for PDF export**: Server-side rendering produces pixel-perfect PDFs. Client-side alternatives are inconsistent with complex layouts.

6. **Zustand over Redux/Context**: Minimal boilerplate, works outside React tree (useful for editor commands), excellent TypeScript support.
