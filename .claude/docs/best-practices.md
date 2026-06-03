# VectorVerify Best Practices

_Created: Mar 8, 2026 | Last Updated: Mar 8, 2026_

## Purpose

Writing code is not just about making something work — it's about making it
clear, maintainable, and consistent with the rest of the system.

This document outlines the standards and conventions expected when working on
the VectorVerify web application.

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
