# Document_Editor

## Commands (package.json scripts)
- Dev: `npm run dev` (`next dev`)
- Build: `npm run build` (`next build`)
- Start: `npm run start` (`next start`)
- Lint: `npm run lint` (`next lint`)
- DB migrate: `npm run db:migrate` (`prisma migrate dev`)
- DB push: `npm run db:push` (`prisma db push`)
- DB seed: `npm run db:seed` (`tsx prisma/seed.ts`)
- DB studio: `npm run db:studio` (`prisma studio`)

## Rules
- Use `npm` (package-lock.json present at root; no yarn.lock/pnpm-lock present)
- `prisma/schema.prisma` is the source of truth for DB schema — run `npm run db:push`/`db:migrate` after edits

## Read first
- `package.json` — scripts and dependencies
- `README.md` — project overview and intended architecture
- `src/app/layout.tsx` and `src/app/page.tsx` — root layout and entry redirect

Architecture: see ARCHITECTURE.md — read before structural changes
