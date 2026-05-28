# VectorVerify

@.claude/docs/architecture.md @.claude/docs/best-practices.md
@.claude/docs/schema.md

## API Reference

The live VectorCam API spec (always current — no local file needed):
https://test.api.vectorcam.org/documentation/json

Fetch this URL when you need endpoint details, request shapes, or response
schemas.

## Working with Claude

- Always read the current state of a file before making changes. Never assume it
  matches a previous version from earlier in the conversation.

## Code Standards

**Architecture**

- Data fetching follows: server function → BFF route (`/api/…/route.ts`) →
  TanStack Query hook (`useGet…`)
- Client components never call backend APIs directly
- Wrap all API responses in `Result<T, E>` — never use try/catch in the UI layer
- Validate all external data with Zod schemas; derive TypeScript types from them

**File placement**

- Shared UI primitives → `src/components/ui/`
- Feature-specific components → `src/features/<feature>/components/`
- Pure data utilities → `src/features/<feature>/utils/`
- Do not promote a component to shared until there is a real second use case

**Components**

- Prefer server components by default; use `'use client'` only when
  interactivity is required
- Keep components small and single-purpose; avoid deeply nested JSX
- Extract complex logic out of render blocks into utilities or memoized values

**Naming**

- React component: `PascalCase` matching filename
- TanStack Query hook: `useGet…`, `usePut…`
- BFF route handler: `GET`, `POST` inside `/api/…/route.ts`
- Zod schema: `…Schema` suffix; derived type: matching PascalCase without suffix
- Utility function: descriptive verb phrase, e.g. `buildSessionSegments`
- Always follow existing patterns before introducing a new variation

**TypeScript**

- Prefer explicit types when clarity matters; use inference when the type is
  obvious
- Avoid `any`, broad unions, and excessive type casting
- Use narrow types (`'PENDING' | 'COMPLETED'`) over broad ones (`string`)
