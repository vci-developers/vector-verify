# VectorVerify Architecture

_Created: Mar 8, 2026 | Last Updated: Mar 8, 2026_

## Why This Document Matters

This is the core technical resource for understanding how the VectorVerify web
application is built and structured. Every developer, intern, or contributor
should read this carefully before attempting feature work.

This guide explains:

- Our overall architectural philosophy
- Folder and module layout
- How the app is split across server-side and client-side code
- How data flows through the app
- How shared API functions work
- How the Result-based structure is used across network calls
- How the BFF (Backend-for-Frontend) layer works
- How TanStack Query is used for client-side data orchestration
- How Zod is used for validation and type inference
- How `proxy.ts` protects routes
- How component modularity is handled across shared and feature-specific UI
- Where to make changes depending on what you are building
- Key files and how they interact
- Performance and implementation considerations

VectorVerify is built with Next.js, React, TypeScript, TanStack Query, and Zod.
The project uses strict TypeScript settings, path aliases, and lint-enforced
module boundaries to keep the architecture disciplined and scalable.

---

## Architectural Philosophy: Modular, Boundary-Driven, and Server-Aware

VectorVerify is designed to be modular, predictable, and maintainable as the
system evolves. The architecture emphasizes clear boundaries between different
parts of the application so that developers can reason about behavior locally
without needing to understand the entire codebase at once.

> **At its core:** dependencies flow toward shared logic — UI and feature layers
> can depend on infrastructure and utilities, but shared modules should never
> depend on UI components or feature implementations.

### Core Principles

- **Separation of concerns** — UI rendering, backend communication, validation,
  and infrastructure logic are implemented in separate modules that interact
  through clearly defined interfaces.
- **Client–server boundary enforcement** — Client-side code handles UI
  interaction and state management. Server-side code handles secure backend
  communication and authentication. These responsibilities are deliberately kept
  separate.
- **Feature modularity** — Workflows are organized into feature-scoped modules
  that encapsulate their own components, API functions, and validation logic.
- **BFF mediation** — Client interactions with backend services are mediated
  through a dedicated server-side layer that centralizes backend communication,
  authentication handling, and request orchestration.
- **Composable component design** — Interface elements are built as small,
  reusable components that can be composed into larger feature-level views.
- **Testability** — Modules are structured with clear boundaries and minimal
  side effects so that core logic, utilities, and feature behavior can be tested
  in isolation.

---

## Folder Structure

| Folder            | Purpose                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| `src/app/`        | App Router pages, layouts, route groups, and BFF route handlers                                            |
| `src/api/`        | Shared backend resource access modules, query hooks, query keys, and validation schemas                    |
| `src/components/` | Shared reusable UI primitives, layout components, and providers                                            |
| `src/features/`   | Feature-scoped modules such as auth, annotation, and review workflows                                      |
| `src/lib/`        | Shared infrastructure such as auth-session helpers, networking utilities, result types, and reusable hooks |
| `src/utils/`      | Small generic helpers used across the app                                                                  |
| `src/proxy.ts`    | Route protection and redirect logic at the application boundary                                            |

---

## Architecture Layers

### The Routing Layer

Defines application entry points, layouts, route groups, and server-side route
handlers. Built using the Next.js App Router.

**Common folders:** `src/app/`, `src/app/api/`

**Examples:**

- `src/app/layout.tsx`
- `src/app/(dashboard)/annotate/page.tsx`
- `src/app/api/annotations/task/route.ts`

---

### The UI Layer

Displays UI, reacts to user interaction, and composes reusable interface
components. Built using React, the Next.js component model, and the shadcn/ui
component library.

Components in this layer should focus on **presentation and composition** — not
complex business logic or backend communication. Interface elements should be
small, composable, and reusable.

**Common folders:** `src/components/`, `src/components/ui/`,
`src/features/<feature>/components/`

**Examples:**

- `login-form.tsx`
- `annotation-task-card.tsx`
- `annotation-workspace.tsx`
- `src/components/ui/button.tsx`

Shared UI primitives from `src/components/ui/` are typically based on shadcn/ui
components, while feature-level components under `src/features/.../components/`
compose these primitives into complete application views.

---

### The Backend Resource Layer

Provides shared access to backend resources used throughout the application.
Centralizes access to backend resources in reusable modules rather than allowing
each feature to implement its own network logic.

Each resource module contains the functions, validation schemas, and hooks
required to retrieve or modify that resource.

**Common folders:** `src/api/`, `src/api/<resource>/`,
`src/api/<resource>/hooks/`, `src/api/<resource>/validation/`

**Examples of resources:** `annotation-task`, `specimen`, `user`, `session`

**Examples of files:**

- `src/api/annotation-task/get-annotation-tasks.ts`
- `src/api/annotation-task/hooks/use-get-annotation-tasks.ts`
- `src/api/user/get-user-profile.ts`
- `src/api/specimen/validation/get-specimens-schema.ts`

---

### The Infrastructure Layer

Provides shared low-level utilities and cross-cutting functionality. Modules
here are generic, reusable, and independent of feature-specific workflows.
Features and API modules can depend on infrastructure utilities, but
**infrastructure modules should not depend on feature code**.

**Common folders:** `src/lib/`, `src/utils/`

**Examples:**

- `safe-api-call.ts`
- `with-auth-session.ts`
- `construct-query-string.ts`
- `result.ts`
- `network-error.ts`

---

### The Feature Layer

Implements application workflows and organizes feature-specific behavior. Each
feature represents a cohesive unit of functionality (e.g. authentication,
annotation tasks, review interfaces) and is self-contained.

```
/feature/
├── components/   ← Feature-specific UI and interaction logic
├── api/          ← Feature-specific API functions when needed
├── lib/          ← Feature-specific helpers or shared logic
└── validation/   ← Zod schemas and feature-specific data contracts
```

---

## Core Principles

### Server-Client Execution Boundaries

The application runs in two separate execution environments with different
capabilities, responsibilities, and security constraints.

**Server-side responsibilities:**

- Communicating with backend services
- Performing upstream API requests
- Handling authentication and session context
- Mediating requests coming from the browser
- Coordinating data retrieval for application pages
- Enforcing security boundaries between the frontend and backend

**Client-side responsibilities:**

- Rendering the user interface
- Handling user input and interaction
- Managing UI state
- Triggering requests for data when needed
- Updating the interface in response to data changes

Client-side code should **not** contain logic that requires access to secure
backend systems or authentication credentials.

---

### Server Functions for Backend Communication

All direct communication with backend APIs is performed through server-side API
functions. These functions are responsible for performing upstream HTTP
requests, attaching authentication context, handling network failures, and
returning responses in a consistent structure.

```ts
import {
    getAnnotationTasksQueryParamsSchema,
    getAnnotationTasksResponseSchema,
    type GetAnnotationTasksQueryParams,
    type GetAnnotationTasksResponseBody,
} from '@/api/annotation-task/validation/get-annotation-tasks-schema';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function getAnnotationTasks(
    accessToken: string,
    queryParams?: GetAnnotationTasksQueryParams,
) {
    const queryString = constructQueryString<GetAnnotationTasksQueryParams>(
        queryParams,
        getAnnotationTasksQueryParamsSchema,
    );

    return safeApiCall<GetAnnotationTasksResponseBody>(
        `/annotations/task${queryString}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        getAnnotationTasksResponseSchema,
    );
}
```

---

### The BFF (Backend-for-Frontend) Layer

Client-side code cannot communicate directly with protected backend APIs.
Instead, it interacts through a BFF layer implemented using Next.js route
handlers. The BFF receives requests from client-side code, validates inputs,
retrieves authentication context, calls the appropriate server function, and
returns a standardized response.

```ts
import { getAnnotationTasks } from '@/api/annotation-task/get-annotation-tasks';
import {
    getAnnotationTasksQueryParamsSchema,
    type GetAnnotationTasksResponseBody,
} from '@/api/annotation-task/validation/get-annotation-tasks-schema';
import { err } from '@/lib/result/result';
import { NextResponse } from 'next/server';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parsedQueryParams =
        getAnnotationTasksQueryParamsSchema.safeParse(queryParams);
    if (!parsedQueryParams.success) {
        return NextResponse.json(
            err({
                kind: 'client',
                status: 400,
                message: 'Invalid query parameters',
            }),
            { status: 400 },
        );
    }

    const result = await withAuthSession<GetAnnotationTasksResponseBody>(
        accessToken => getAnnotationTasks(accessToken, parsedQueryParams.data),
    );

    return NextResponse.json(result, {
        status: result.ok ? 200 : (result.error.status ?? 400),
    });
}
```

---

### Client Data Fetching with TanStack Query

Client-side data fetching uses TanStack Query. The typical flow:

1. Client components trigger data requests
2. TanStack Query manages the request lifecycle
3. The BFF layer (`/app/api/...`) handles secure server communication
4. Server functions perform the upstream backend call

```ts
import {
    getAnnotationTasksQueryParamsSchema,
    type GetAnnotationTasksQueryParams,
    type GetAnnotationTasksSuccessPayload,
} from '@/api/annotation-task/validation/get-annotation-tasks-schema';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { annotationTaskKeys } from '@/api/annotation-task/annotation-task-keys';
import type { NetworkError } from '@/lib/network/network-error';
import { constructQueryString } from '@/lib/network/construct-query-string';
import type { Result } from '@/lib/result/result';

type GetAnnotationTasksQueryResult = Result<
    GetAnnotationTasksSuccessPayload,
    NetworkError
>;
type GetAnnotationTasksQueryOptions = Omit<
    UseQueryOptions<GetAnnotationTasksQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchAnnotationTasks(
    queryParams?: GetAnnotationTasksQueryParams,
): Promise<GetAnnotationTasksQueryResult> {
    const queryString = constructQueryString<GetAnnotationTasksQueryParams>(
        queryParams,
        getAnnotationTasksQueryParamsSchema,
    );

    const response = await fetch(`/api/annotations/task${queryString}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
    });

    return response.json();
}

export function useGetAnnotationTasks(
    queryParams?: GetAnnotationTasksQueryParams,
    options?: GetAnnotationTasksQueryOptions,
) {
    return useQuery({
        queryKey: annotationTaskKeys.annotationTasks(queryParams),
        queryFn: () => fetchAnnotationTasks(queryParams),
        ...options,
    });
}
```

---

### Query Keys

Query keys are defined in centralized modules so they can be reused consistently
across the application.

```ts
import type { GetAnnotationTasksQueryParams } from '@/api/annotation-task/validation/get-annotation-tasks-schema';

export const annotationTaskKeys = {
    root: ['annotation-tasks'] as const,
    annotationTasks: (queryParams?: GetAnnotationTasksQueryParams) =>
        ['annotation-tasks', queryParams] as const,
};
```

---

### Zod Schemas and Validation Contracts

Zod is used for runtime validation and TypeScript type inference. All external
data entering the application must be validated.

**Query parameter validation:**

```ts
export const getAnnotationTasksQueryParamsSchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    title: z.string().optional(),
    status: annotationTaskStatusSchema.optional(),
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
});

export type GetAnnotationTasksQueryParams = z.infer<
    typeof getAnnotationTasksQueryParamsSchema
>;
```

**Request body validation:**

```ts
export const putAnnotationByIdRequestSchema = z.object({
    morphSpecies: z.string().optional(),
    morphSex: z.string().optional(),
    morphAbdomenStatus: z.string().optional(),
    visualSpecies: z.string().optional(),
    visualSex: z.string().optional(),
    visualAbdomenStatus: z.string().optional(),
    notes: z.string().optional(),
    status: annotationStatusSchema,
});

export type PutAnnotationByIdRequestBody = z.infer<
    typeof putAnnotationByIdRequestSchema
>;
```

**Response body validation:**

```ts
export const getAnnotationTasksResponseSchema = z.object({
    tasks: z.array(annotationTaskSchema),
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
    hasMore: z.boolean(),
});

export type GetAnnotationTasksResponseBody = z.infer<
    typeof getAnnotationTasksResponseSchema
>;
export type GetAnnotationTasksSuccessPayload = GetAnnotationTasksResponseBody;
```

**Feature-level form validation:**

```ts
export const signupFormSchema = z
    .object({
        email: z.email('Enter a valid email'),
        password: z
            .string()
            .min(1, 'Password is required')
            .max(128, 'Password is too long'),
        confirmPassword: z.string().min(1, 'Confirm Password is required'),
    })
    .refine(data => data.password === data.confirmPassword, {
        message: 'Passwords must match',
        path: ['confirmPassword'],
    });

export type SignupFormInput = z.infer<typeof signupFormSchema>;
```

**Shared resource shapes:**

```ts
export const annotationTaskSchema = z.object({
    id: z.number(),
    annotatorId: z.number().optional(),
    title: z.string(),
    description: z.string(),
    status: annotationTaskStatusSchema,
    annotationCounts: z
        .object({
            total: z.number(),
            pending: z.number(),
            annotated: z.number(),
            flagged: z.number(),
        })
        .optional(),
    createdAt: z.number(),
    updatedAt: z.number(),
    annotator: userProfileSchema.optional(),
});
```

---

### Server Actions

Server Actions allow certain operations to run directly on the server. They are
defined using the `'use server'` directive and are typically used for
authentication flows, cookie/session updates, server-side redirects, and simple
mutations.

```ts
'use server';

import { clearAuthCookies } from '@/lib/auth-session/cookies';
import { redirect } from 'next/navigation';

export async function logout() {
    await clearAuthCookies();
    redirect('/login');
}
```

---

### Request Protection with `proxy.ts`

`proxy.ts` enforces authentication rules at the edge before a request reaches
application routes. Its responsibilities:

- Checking whether authentication cookies are present
- Redirecting unauthenticated users to the login page
- Preventing authenticated users from accessing public authentication routes
- Ensuring protected routes remain secure

---

### Component Abstraction and Modularity

The application distinguishes between:

- **Shared components** — live in `src/components/` and provide reusable
  building blocks (layout elements, buttons, cards, tables, input controls)
- **Feature-specific components** — live in `src/features/` and compose shared
  building blocks into complete screens and workflows

**Server Components:**

- Render on the server
- Can fetch data directly from server functions
- Do not include browser-side interactivity
- Reduce client bundle size

**Client Components:**

- Run in the browser
- Handle user interactions and dynamic UI behavior
- Can use hooks (`useState`, `useEffect`, TanStack Query)
- Declared using the `'use client'` directive

---

## Best Practices

- Favor simple, predictable patterns over clever abstractions
- Keep features self-contained so related logic stays easy to locate and modify
- Reuse existing infrastructure and utilities before introducing new patterns
- Make data flow explicit and easy to trace from UI interaction to backend
  response
- Prioritize readability and maintainability so new contributors can quickly
  understand the system
