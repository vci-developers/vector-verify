# Implementation checklist

Mined from Aryaman's reviews (PRs #71–#204, ~490 comments). Each rule: the
check, then his words. `[saved]` = already in memory; `[new]` = not yet.

## Types and data shape

- **No derived intermediate types.** Can the type/field be computed from data
  already in scope? Delete it. [saved] — "I would refrain from creating
  intermediate types as much as possible, because it creates confusion" (#120),
  "get rid of a derived intermediate field" (#161), "SiteMarker, TMarker,
  GeocodeMarker… do a second pass" (#145), "Is it absolutely necessary?" (#132)
- **No derived props or maps.** If `b` is derivable from `a`, pass `a` only.
  [new] — "monthKeys can be derived from months" (#109), "isn't certifiedSiteIds
  derivable from certifiedCountsBySiteId?" (#119), "the key is derived from the
  value" (#119), "Can you not derive answeredFormQuestions…" (#204)
- **Merge parallel maps.** Two maps keyed by the same id → one map to an object.
  [new] — "merge siteIdToNeedsReviewCount and siteIdToSessionCounts?" (#87),
  "activeDevices and activeDeviceCount?" (#145)
- **Pass whole domain objects, not fields.** [saved] — "take in the site itself
  instead of 4 params" (#145), "pass the entire site instead" (#162), "These
  props are way too specific. Pass in whole objects" (#71), "Just pass the
  entire specimen" (#120)
- **Narrow types from the schema, not `string`.** Use the enum/schema type for a
  known value set; no `unknown`/`any`; no needless casts. [new] — "using a
  string list is way too generic" (#126), "Refrain from using unknown and any"
  (#93), "no need to cast this" (#126). Exception: review-state picker keeps
  full `SessionState[]` (#171).
- **Reuse existing domain types.** `GetXSuccessPayload['data']` over a hanging
  type; `siteSchema` over a lookalike. [saved, partial] — (#93, #76)
- **Client code uses `…SuccessPayload`; `…ResponseBody` is server-only.**
  `LucideIcon`, not `typeof CircleAlert`. [saved] — (#204)
- **Type placement.** No types defined in a leaf component and imported by a
  parent; shared types → own schema file / core domain model. [new] — "using a
  type that is defined in a more granular component, in a higher level
  component" (#72), "pulling random types from components" (#145), "Composite
  domain models should get their own schema file" (#80)

## Components and React

- **No prop drilling.** A prop that only passes through, or isn't used, goes.
  [saved] — "Seems like this is just prop drilling" (#124), "multiple layers of
  prop drilling" (#80)
- **Children over props when the parent already has the data.** [saved] — "Why
  pass this as a prop instead of having child components… sites are already
  passed in" (#145), "pass in children and just render as children" (#145)
- **State lives in the component that consumes it.** [new] — "Why not keep this
  inside the component that consumes this?" (#124), "Why did we remove local
  state and make them props instead?" (#124)
- **One component per file; files single-purpose.** [new] — "One component per
  file" (#145, #163), "This file is doing WAY too much" (#93, #72)
- **Reuse shadcn primitives; don't edit generated shadcn files.** [saved] —
  Legend (#165), Button (#145), Table (#109), "Why did you change this?"
  chart.tsx (#93), skeleton.tsx (#86)
- **`<Fragment>`, not `<>`.** [new] — (#72, #80, #93, #148)
- **Avoid `useMemo` / `useEffect` unless needed.** [new] — "Refrain from using
  useMemo unless absolutely needed" (#72, #119), "this can be handled using
  button click handlers?" (#120)
- **Query hook, never the client/server function directly.** [saved] — (#179,
  #148, #163)
- **`isPending`, not `isLoading`.** [new] — "isLoading is only true for the
  initial fetch" (#74, #72)
- **One loading + one error branch, success last.** No per-item condition
  chains; failed `Result` gets its own error branch. [saved, partial] — "loading
  and error state instead of so many conditions" (#181), "Otherwise, the UI will
  perpetually be in a loading state" (#86), "move all success states below the
  loading and error states" (#72)
- **Pickers/tabs belong in the header; page↔page-client is 1:1.** [saved,
  partial] — (#132, #75, #80)
- **Server components can't use hooks; auth redirects live in `proxy.ts`.**
  [saved, partial] — (#72, #148)

## Functions and files

- **Inline single-consumer or one-line helpers.** [new] — "If there is only one
  consumer of this, should we inline it?" (#132, #120), "This is a single line
  function. I would just inline it" (#109), hooks used by one component move
  into it (#119, #72)
- **One pass, not chained filters.** [saved] — "filter after filter after
  filter" (#179)
- **Don't export what isn't used outside the file.** [new] — (#109, #93, #76,
  #90)
- **Delete dead code and unused files.** [new] — (#82, #75, #122, #155)
- **Shared helpers go to root `lib/`/`hooks/`; feature-only stays in the
  feature.** [saved] — (#124, #179, #163, #72)
- **Duplicated components across features → lift to shared.** [new] — (#119)

## API layer

- **Reads are `GET` with `constructQueryString`, never `POST`.** Repeated params
  use singular keys + `z.coerce`. [new] — (#80)
- **Get-all functions propagate the first error, no silent `.filter(ok)`.**
  [saved, partial] — (#80)
- **Get-all query params required** (no unbounded lists); respect backend
  `limit` ≤ 100. [new] — (#76, #163)
- **Path params match the backend route** (`/programs/{id}/…`, not a query
  param). [new] — (#132)
- **Request body and query params validated with separate schemas.** [new] —
  (#119, #114)
- **`.partial()` over per-field `.optional()`.** [saved] — (#179)
- **Don't add Zod defaults/nullables the backend never produces.** [new] — (#93,
  #90)

## Naming

- **Full descriptive names; no abbreviations or single letters.** `index` not
  `idx`, `value` not `val`, `site` not `s`. [saved] — (#71, #72)
- **No vague nouns.** "What is an item?" "Rows of what?" "What is this map
  storing?" [saved] — (#119, #72, #80, #140)
- **`Result` variables: `<call>Result`; pending: `is<Call>Pending`.** [new] —
  `getProgramsResult`, `isGetAllSessionsPending` (#74, #71, #145)
- **API files/types carry the HTTP verb.** `post-verify-email-schema.ts`,
  `PostVerifyEmailSuccessPayload`. [new] — (#148)
- **Use codebase vocabulary.** session not submission; no "sentinel"; "view
  model" only for real view models. [new] — (#145, #171, #93)
- **Handlers/consts named for what they hold.** `handleCycleIdsChange`,
  `RANGE_PRESET_TABS`, i18n keys not `capsLoading`. [new] — (#132, #163, #140)
- **Consistent naming for one concept.** "Resend verification code or resend
  verification email?" [new] — (#148)

## Program-agnostic

- **No Uganda/district/house assumptions.** Use top-level location type; test on
  Ghana. [saved, partial] — (#155, #71, #80, #93)
- **Country-specific data in a country folder.** [new] — (#119, #199)
- **Never mix programs** (scope to logged-in program, clear storage on logout).
  [new] — (#163, #155)
- **Dates in the cycle's local timezone, not UTC.** [new] — (#154, #141)

## Hygiene

- **No `console.log`, no ESLint suppressions, no unresolved warnings.** [new] —
  (#148, #72, #122)
- **`@/` imports, no `../`.** [saved] — (#74, #72)
- **No hardcoded user-facing strings.** [saved] — (#163)
- **No magic numbers/styles; use the theme.** [new] — (#93)
- **Don't touch files unrelated to the PR.** [saved] — (#82, #93)
