# ErasmusMate Final Prototype

Frontend-first Erasmus mobility prototype with API routes backed by Prisma + SQLite demo data.

## Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod
- TanStack Query
- Prisma ORM (SQLite)

## Local bootstrap (empty environment)

### 1) Install dependencies
```bash
npm install
```

### 2) Configure environment
Create `.env` in the project root:

```bash
DATABASE_URL="file:./dev.db"
```

### 3) Apply migrations
```bash
npm run db:migrate
```

### 4) Seed realistic demo data
```bash
npm run db:seed
```

This seed includes:
- institutional flows (student + coordinator submissions, audit events, exceptions)
- administrator account/role assignment
- social discovery, connections, moderation, messages, content, favorites, and map-linked content

### 5) Run the prototype
```bash
npm run dev
```

Open: `http://localhost:3000`

## Useful DB commands
- Reset DB + rerun migrations + reseed:
  ```bash
  npm run db:reset
  npm run db:seed
  ```

## Scripts
- `npm run dev` — start Next.js dev server
- `npm run build` — production build
- `npm run start` — run production server
- `npm run lint` — lint
- `npm run typecheck` — TypeScript check
- `npm run db:migrate` — apply Prisma migrations
- `npm run db:seed` — run Prisma seed script
- `npm run db:reset` — reset local Prisma DB
