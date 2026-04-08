# ErasmusMate

Read all files inside /artifacts and all images inside /figma before making changes.

## Goal
Implement a frontend-first web application for ErasmusMate.

## Product structure
ErasmusMate has:
1. a primary institutional/manual-assisted Erasmus mobility management core
2. a secondary social-support layer

The institutional core must remain primary.
The social-support layer must remain clearly separated from official procedure navigation.

## Source of truth
- /artifacts/FINAL REQUIREMENTS + PROPOSAL.docx
- /artifacts/FINAL BUSINESS RULES.docx
- /artifacts/FINAL WORKFLOWS.docx
- /artifacts/CODE DIAGRAM INSTITUTIONAL V3.docx
- /artifacts/CODE DIAGRAM SOCIAL V3.docx
- /figma/*.png

## Stack
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query
- mocked data only

## Constraints
- Do not invent scope beyond the artifacts.
- Do not implement backend.
- Do not mix official institutional navigation with social discovery.
- Do not add route planning.
- Do not add real-time user tracking.
- Do not create a generic social-media feed.

## Implementation priorities
1. App shell and navigation
2. Student institutional flows
3. Coordinator review flows
4. Administrator governance/moderation flows
5. Social discovery, connections, messaging, recommendations, tips, ratings
6. Map-based social discovery

## Done means
- the app runs
- the main routes exist
- the main student/coordinator/admin flows exist
- social-support flows exist
- map discovery exists
- mocked data and realistic UI states exist
