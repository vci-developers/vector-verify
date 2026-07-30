# View state lives in the URL, not localStorage

Dashboard view state (active tab, date range, selected location, species filter,
geographical view) was written to `localStorage` with no tie to _who_ wrote it.
When a second user logged in on the same device without the browsing context
being torn down, they inherited the previous user's state — most visibly a
`selectedLocation` (district/site) from another program showing in the selector.
A new user must never see the previous user's state, however the previous
session ended.

## Status

accepted — supersedes the approach on the abandoned
`bug-fix/logout-clear-local-storage` branch (clear stored keys on logout and on
`/login` mount), which patched the symptom while leaving the identity-blind
storage in place.

## Context

- Login and logout are SPA navigations, not full page loads, so no Web Storage
  API auto-resets on a user swap. Server-detected session ends (token timeout)
  redirect to `/login` from ~8 server components, and signup sets auth cookies
  without ever passing through `/login` — so no single client-side cleanup point
  exists that covers every path without ongoing vigilance.
- Documented production practice puts this kind of state in the URL, not in
  browser storage: the official Next.js dashboard guidance uses search params
  for filters/search/pagination (bookmarkable, shareable, server-renderable),
  and client-storage guidance reserves `localStorage` for non-sensitive,
  device-scoped data cleared at session end (OWASP). User-scoped view state in
  shared, identity-blind `localStorage` keys — what this app had — matches no
  documented pattern; the bug is a direct symptom of it.
- The tree/marker state (`expandedSitePaths`, `collapsedSegments`,
  `selectedMarkerId`) was already reset by effects whenever filters changed —
  its persistence across sessions was incidental, not designed.

## Considered Options

- **URL search params for view state + in-memory ephemeral state (chosen).** The
  leak becomes impossible by construction — the URL carries no identity to leak
  and dies with the navigation. Views become shareable and bookmarkable.
  `useLocalStorage`/`StorageKeys` and all cleanup machinery get deleted. Costs:
  the hardcoded back link from site details must thread the list's query string,
  and tree state resets on hard refresh (accepted — it already reset on every
  filter change).
- **Clear stored keys at the auth gate** (`/login`/`/signup` mount, plus a
  `Clear-Site-Data: "storage"` response header). OWASP-sanctioned as session
  hygiene and was the interim plan, but it treats the symptom: every new
  auth-entry surface must remember to wipe, and the same user loses their view
  on every relogin as collateral. Superseded by fixing the storage model itself.
- **Namespace keys by userId.** Fixes cross-user leakage but keeps view state in
  storage, needs an async identity source at read time, and accumulates orphaned
  per-user key sets.
- **Server-side user preferences.** The documented home for durable,
  cross-device preferences (theme, defaults) — but per-visit view state is not a
  durable preference, and this needs backend work. Not taken.
- **`sessionStorage`.** Does not fix the bug: the user swap happens in one open
  tab, which `sessionStorage` survives.

## Decision

Move all view state to URL search params on `/review` and `/operations`,
implemented on Next primitives (`useSearchParams` + the documented native
history API integration — no new dependency, no server round-trip per filter
change). Param values are external input and are validated with Zod: invalid or
absent params fall back to today's defaults. Params at their default value are
omitted from the URL (the GitHub / nuqs `clearOnDefault` pattern): a bare
`/review` or `/operations` is the canonical default view, and a bookmark taken
without touching a filter keeps meaning "the current defaults" rather than
freezing the month range in effect the day it was saved.

nuqs was declined as a dependency but adopted as the reference spec: when a
URL-state behavior question arises, follow its documented defaults
(`clearOnDefault`, replace-not-push for filters, push for navigation-like
params, param schemas colocated with the owning page). Ephemeral interaction
state (`expandedSitePaths`, `collapsedSegments`, `selectedMarkerId`) moves to
plain component state. Navigation from the Review list to site details threads
the list's query string so the back link restores the exact view.

`useLocalStorage` and `StorageKeys` are deleted. The login-screen mount keeps a
one-release sweep that removes the known legacy keys from users' browsers, then
that sweep is removed too.

## Consequences

- A dashboard URL now fully describes what the page shows. New view state must
  be added as a search param, never as browser storage — adding a `localStorage`
  key for view state reintroduces the leak class this ADR eliminates.
- "Same user gets their view back?" is user-controlled: history and bookmarks
  restore it exactly; fresh navigations start at defaults. No wipe-on-login
  policy exists anymore.
- Tree expansion and marker selection reset on hard refresh.
- Links into `/review` and `/operations` (nav, redirects) land on defaults
  unless they carry params — the site-details back link is the one place that
  must thread them.
