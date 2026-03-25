# Document Editor

A Google Docs-style collaborative document editor with real-time multi-user editing, rich text formatting, and document management.

## Features

- **Rich Text Editing** -- Full-featured editor with headings, lists, tables, code blocks, images, task lists, text alignment, and syntax highlighting powered by Tiptap v2
- **Real-Time Collaboration** -- Multiple users can edit simultaneously with live cursors, powered by Yjs CRDT and Hocuspocus WebSocket server
- **Sharing and Permissions** -- Role-based access control (Viewer, Commenter, Editor, Admin) with a share dialog and email invitations
- **Comments and Suggestions** -- Anchored comment threads and track changes support
- **Version History** -- Document snapshots with diff comparison and restore capability
- **Export** -- Export documents to PDF (via Puppeteer) and DOCX formats
- **Offline Support** -- Continue editing without a connection using IndexedDB persistence, with automatic sync on reconnect
- **Dashboard** -- Document listing, search, trash, and user settings

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router, TypeScript) |
| Styling | Tailwind CSS + Radix UI primitives |
| Editor | Tiptap v2 (ProseMirror-based) |
| Real-Time | Yjs CRDT + Hocuspocus WebSocket server |
| Database | PostgreSQL 15+ with Prisma ORM |
| Authentication | Auth.js v5 (NextAuth v5) + Prisma adapter |
| Storage | S3-compatible (AWS S3 / MinIO for development) |
| State Management | Zustand |
| Cache / PubSub | Redis |
| Export | Puppeteer (PDF), docx library (DOCX) |
| Testing | Vitest (unit), Playwright (E2E), Testing Library (component) |

## Architecture

The application is composed of two main processes:

1. **Next.js Application** -- Serves the React frontend and exposes REST API routes for document CRUD, comments, permissions, version history, and exports. Handles authentication via Auth.js and issues short-lived JWT tokens for WebSocket connections.

2. **Hocuspocus Server** -- A standalone Node.js process that manages persistent WebSocket connections for real-time collaboration. It runs separately from Next.js because serverless environments cannot hold long-lived connections. Hocuspocus verifies JWT tokens issued by the Next.js app, persists Yjs document state to PostgreSQL, and uses Redis for pub-sub across multiple server instances.

3. **Yjs CRDT** -- Provides conflict-free collaborative editing on the client. Each client maintains a local copy of the document and syncs changes through the Hocuspocus WebSocket. Offline edits are stored in IndexedDB via `y-indexeddb` and automatically merged when the connection is restored.

PostgreSQL stores all persistent data including users, documents (Yjs binary state), permissions, comments, and version snapshots. Redis handles caching and multi-instance coordination. S3-compatible storage holds uploaded images and exported files.

## Project Structure

```
├── prisma/                     # Database schema and migrations
├── collab-server/              # Hocuspocus WebSocket server (separate process)
│   └── src/extensions/         # Auth, persistence, webhook hooks
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
└── tests/                      # Unit, integration, E2E tests
```

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/ALPHAMAN-0/Document_Editor.git
cd Document_Editor
```

2. Install dependencies:

```bash
npm install
```

3. Copy the example environment file and configure it:

```bash
cp .env.example .env
```

4. Set the required environment variables in `.env`:

```
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/document_editor"

# Auth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Redis
REDIS_URL="redis://localhost:6379"

# S3 / MinIO
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
S3_BUCKET="documents"

# Hocuspocus
HOCUSPOCUS_SECRET="your-collab-secret"
```

5. Start the infrastructure services:

```bash
docker compose up -d
```

6. Run database migrations and seed data:

```bash
npm run db:migrate
npm run db:seed
```

7. Start the development servers:

```bash
# Terminal 1 -- Next.js
npm run dev

# Terminal 2 -- Hocuspocus collaboration server
npm run collab
```

The application will be available at `http://localhost:3000`.

## Development Commands

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run collab` | Start Hocuspocus collaboration server |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed development data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run build` | Production build |
| `npm run test` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run lint` | ESLint + TypeScript check |
| `docker compose up -d` | Start PostgreSQL, Redis, MinIO |

## License

This project is licensed under the MIT License.
