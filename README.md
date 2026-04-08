# ErasmusMate Frontend Scaffold

Next.js + TypeScript + App Router project scaffold for ErasmusMate.

## Included
- `src/app` route groups for strict separation:
  - `src/app/(institutional)/...`
  - `src/app/(social)/...`
- Tailwind CSS setup
- shadcn/ui primitives in `src/components/ui`
- React Hook Form + Zod infrastructure
- TanStack Query provider at app root
- mocked-data layer under `src/lib/mock`
- shared app shell components in `src/components/layout`
- demo role switching (Student / Coordinator / Administrator)

## Run
```bash
npm install
npm run dev
```
