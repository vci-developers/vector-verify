# VectorVerify Best Practices

_Created: Mar 8, 2026 | Last Updated: Jun 4, 2026_

## Purpose

Writing code is not just about making something work — it's about making it
clear, maintainable, and consistent with the rest of the system.

This document outlines the standards and conventions expected when working on
the VectorVerify web application.

---

## Non-Negotiable Implementation Rules

> **These rules are extremely important and MUST be followed for every single
> implementation — no exceptions.** They take precedence over personal style.
> When in doubt, copy the nearest existing example exactly.

1. **Minimal util files.** A file in a `utils/` folder contains _only_ true,
   pure utility functions — no React, no I/O, no state. Keep one cohesive
   responsibility per file (e.g. `build-collection-cycle-segments.ts`,
   `accumulate-session-summary.ts`). Do not create a util file as a dumping
   ground for unrelated helpers, and do not put logic in `utils/` that belongs in
   a component, hook, or server function.

2. **No intermediate types or interfaces.** Domain types come from the core Zod
   schemas via `z.infer` — never hand-write a parallel type for data that a
   schema already describes. The only types you may declare outside schemas are
   ones that are _absolutely necessary_ and have no schema equivalent: component
   prop interfaces (`…Props`) and tiny local UI-state unions (e.g.
   `'idle' | 'exporting'`). If you find yourself writing an interface that mirrors
   a schema, delete it and infer instead.

3. **Names must convey exact meaning.** Every variable, function, and component
   name states precisely what it holds and what it does — no abbreviations, no
   vague nouns (`data`, `item`, `temp`, `handle`). Prefer
   `certifiedCountsByMonth` over `counts`, `submitDhis2Sync` over `submit`. The
   name alone should make the code readable without comments.

4. **Simplest possible solution.** Achieve the full functionality in the fewest
   lines and fewest files that remain clear. Do not add abstraction, options, or
   layers that the current requirement does not need. Fewer moving parts beats
   cleverness. Do not promote a component/util/type to "shared" until there is a
   real second consumer.

5. **Mirror the existing patterns and file structure exactly.**
   - **API endpoints follow the EXACT structure** of existing resources under
     `src/api/<resource>/`:
     - `<verb>-<resource>.ts` — `'server-only'` server function that calls
       `safeApiCall` and returns `Result<T, NetworkError>`.
     - `hooks/use-<verb>-<resource>.ts` — TanStack Query/Mutation hook that
       fetches the BFF route (`/api/…`), never the backend directly.
     - `validation/<…>-schema.ts` — Zod schemas (`…Schema`) + inferred types.
     - `<resource>-keys.ts` — query-key factory (`{ root, … }`).
     - `src/app/api/<resource>/route.ts` — BFF handler: `safeParse` query/body →
       `err()` on failure → `withAuthSession` → `NextResponse.json(result, {
       status })`.
   - **UI hierarchy stays consistent across features.** Feature code lives in
     `src/features/<feature>/components/` (and `utils/`), mirroring how existing
     features (e.g. `review`) are laid out. New screens look and nest like the
     ones already there.

6. **Use shadcn/ui components wherever possible.** Reach for the primitives in
   `src/components/ui/*` (Button, Checkbox, Input, Dialog, Badge, Table, etc.)
   instead of raw HTML elements or bespoke CSS. Only drop to a raw element when no
   shadcn primitive fits.

7. **Other enforced conventions.**
   - Wrap all backend results in `Result<T, E>`; **never** use `try/catch` in the
     UI layer.
   - Validate _all_ external data (responses, bodies, query params, forms) with
     Zod before use.
   - Server components by default; add `'use client'` only when interactivity is
     genuinely required.
   - Keep complex expressions out of JSX — lift them into named variables,
     memoized values, or utils.
   - No magic numbers or hardcoded UI strings — extract to constants / i18n
     resources.
   - Leave each file better than you found it; match the surrounding code's
     idiom, comment density, and naming.

---

## General Clean Coding Principles

| Principle                               | Description                                                                                    |
| --------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Small, single-purpose functions         | Functions should do one thing and do it well. If it starts doing multiple things, split it up. |
| Clear naming > clever naming            | Names should describe intent and behavior. Avoid abbreviations that make code harder to read.  |
| Avoid duplication                       | If the same logic appears multiple times, extract it into a shared utility or module.          |
| No magic numbers                        | Extract numbers or hardcoded strings to constants (or string resources if UI-related).         |
| Minimize side effects                   | Functions should not unexpectedly change global state.                                         |
| Leave the code better than you found it | If something's unclear or messy — improve it.                                                  |

---

## TypeScript Best Practices

### Do

```ts
// Prefer explicit types when clarity matters
type AnnotationTask = { id: number; status: 'PENDING' | 'COMPLETED' };

// Use type inference when obvious
const count = tasks.length;

// Prefer const over let
const tasks = [];

// Use type-safe contracts derived from Zod schemas
export type GetAnnotationTasksResponse = z.infer<
    typeof getAnnotationTasksResponseSchema
>;

// Use narrow types instead of broad ones
status: 'PENDING' | 'COMPLETED';
```

### Avoid

```ts
// any
function process(data: any) {}

// Unclear union types
string | number | boolean | object;

// Excessive type casting
const value = something as unknown as MyType;

// Broad types when narrow ones are available
status: string;
```

---

## React Component Best Practices

### Do

- Keep components small and focused
- Break complex pages into smaller reusable components
- Use server components whenever possible
- Use client components only when interactivity is required
- Prefer declarative rendering:

```tsx
{
    tasks.map(task => <TaskCard key={task.id} task={task} />);
}
```

- Keep components readable and predictable

### Avoid

- Large monolithic page files
- Deeply nested JSX
- Embedding complex logic directly inside render blocks:

```tsx
// Don't do this
{tasks.filter(...).map(...).sort(...)}
```

---

## Data Fetching and Server Interaction

- Follow the established architecture patterns
- Use the custom `Result<T, E>` type defined in `lib/result` to wrap
  success/failure and keep flow safe
- Avoid `try/catch` in the UI layer — errors should be caught and logged
  upstream
- For unrecoverable issues, show a user-friendly message via a UI state update
  or event

### Client Components

- Client components should **never** call backend APIs directly
- All data fetching should happen through TanStack Query and BFF endpoints

### Server Components

- Server components can fetch data using server functions
- They should not contain client-side hooks (`useState`, `useEffect`,
  `useQuery`)

---

## Zod Validation Best Practices

All external data entering the application must be validated. Use Zod schemas
for:

- API request bodies
- API responses
- Query parameters
- Form validation

---

## Component Modularity and Styling

- Favor composition over duplication
- Shared UI primitives live in `src/components/`. Feature-specific UI lives in
  `src/features/<feature>/components/`
- Avoid copying UI logic between features — extract reusable components instead
- Prefer utility classes rather than custom CSS. Avoid large, custom stylesheets
- Prefer using the styling classes already defined in `globals.css`

---

## Naming Conventions

| Type                | Example                                                           |
| ------------------- | ----------------------------------------------------------------- |
| React Component     | `AnnotationTaskCard`, `LoginForm`, `DashboardPageClient`          |
| Page Component      | `AnnotationTasksPage`                                             |
| Server Function     | `getAnnotationTasks`, `putAnnotationById`                         |
| BFF Route Handler   | `GET`, `POST` inside `/api/…/route.ts`                            |
| TanStack Query Hook | `useGetAnnotationTasks`, `usePutAnnotationById`                   |
| Query Keys          | `annotationTaskKeys`, `annotationKeys.root`, `userKeys.profile()` |
| Zod Schema          | `getAnnotationTasksResponseBodySchema`, `loginFormSchema`         |
| Type from Schema    | `GetAnnotationTasksResponseBody`, `LoginFormInput`                |
| Utility Function    | `constructQueryString`, `safeApiCall`                             |
| Feature Folder      | `annotation-task`, `auth`                                         |

Always follow the existing naming structure before introducing your own
variation.

---

## Performance Tips

- Prefer Server Components by default. Only introduce Client Components when
  browser-side interactivity is required
- Use TanStack Query caching effectively. Reuse query keys and avoid unnecessary
  refetching
- Avoid expensive computations inside render logic. Extract complex operations
  into utilities or memoized values
- Use pagination or lazy rendering for large datasets instead of rendering large
  lists all at once

---

## How to Leave the Code Better

Engineering responsibility includes improving the codebase over time:

- Fix naming inconsistencies
- Improve unclear logic or split large functions
- Add documentation to confusing blocks
- Reduce duplication (e.g., repeated validation logic)
- Improve type safety
- Add TODOs where work is still needed — and file a ticket in JIRA

If you come across unclear or messy code, don't ignore it — clean it up or
document it for the next person.

---

## Pre-PR Checklist

Before submitting a pull request or starting a new feature, make sure:

- [ ] The feature follows the existing folder and feature structure
- [ ] Server and client responsibilities remain clearly separated
- [ ] Data fetching follows the server function → BFF → TanStack Query pattern
- [ ] Zod schemas define and validate all external data contracts
- [ ] Components are modular and reusable, not large monolithic pages
- [ ] Query keys and hooks follow the existing naming patterns
- [ ] No business logic or API calls are embedded directly in UI components
- [ ] Naming conventions match the existing codebase patterns
- [ ] The code is readable, typed, and consistent with existing architecture
