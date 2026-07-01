# Clearing persisted UI state across user sessions

Persisted UI state (`StorageKeys` in `src/lib/storage-keys.ts` — active tab,
date range, selected location, expanded site paths, etc.) is written to
`localStorage` with no tie to _who_ wrote it. When a second user logs in on the
same device without the browsing context being torn down, they inherit the
previous user's state — most visibly a `selectedLocation` (district/site) from
another program showing in the selector. We need a new user to never see the
previous user's state, however the previous session ended.

## Status

accepted

## Context

Two facts about this codebase constrain the solution:

1. **Login and logout are SPA navigations, not full page loads.** `logout()`
   does `redirect('/login')`; login does `router.replace('/')`. Neither tears
   down the browsing context, so **no Web Storage API auto-resets on a user
   swap** — `sessionStorage` included (it only clears on tab _close_, which is
   not the reported scenario). Some explicit reset is therefore unavoidable; the
   only question is _where_ it lives.

2. **Every non-button logout is detected server-side.** Token timeout / missing
   cookie surfaces in `with-auth-session.ts` as `unauthorized`, and ~8 server
   components (`(dashboard)/layout.tsx`, the operations/review/annotate
   layouts + pages, `review/[siteId]/page.tsx`) call `redirect('/login')`.
   `localStorage` does not exist on the server, so cleanup **cannot** be placed
   where these logouts happen. There is currently no client-side auth-error
   interceptor (`TanstackProvider` is bare; pages that receive `unauthorized`
   just render the message), and adding one fights the `Result` convention — the
   fetchers _return_ `unauthorized`, they never throw, so a React Query
   `onError` handler would not fire.

The consequence of (2): the single client-side point every session-end path
funnels through — button logout, token timeout, expired-tab reopen, direct nav —
is **the `/login` screen mounting**. That, not the logout action, is the natural
home for cleanup.

A separate requirement shapes the pick: a **fresh session on every login**,
including the _same_ user logging back in (logging out of a tab and back in
should land on defaults, not restore the last tab). Only the login boundary
carries the information that separates "same-user relogin" (fresh) from
"same-user refresh" (restore) — user identity does not, since it is unchanged.

## Considered Options

- **Clear on the `/login` mount (leading candidate).** One `useEffect` in
  `LoginForm` (already a client component, always rendered on `/login`) removes
  all `StorageKeys`. Covers button logout _and_ every server-redirect logout,
  because they all land here; fires on _arrival at the gate_, before the next
  user authenticates. Makes the current logout-button clear (e53d181) redundant.
  Issues: (a) not instantaneous — stale bytes persist in the gap between token
  death and the redirect landing (tiny, and unavoidable client-side since the
  client only learns of expiry on the next request); (b) also fires if an
  authenticated user navigates to `/login` (confirm `/login` redirects authed
  users away); (c) relies on enumerating `StorageKeys`, so a future key stored
  elsewhere leaks silently.

- **Validate `selectedLocation` against the current user's accessible options
  (leading candidate, composable).** In `use-location-selection.ts`, treat a
  stored location that is not in `locationDropdownOptions` as stale and reset
  it. One file, zero auth coupling, self-heals for program reassignment and
  deleted sites too. Issues: (a) fixes only the _visible_ selector — dates, tab,
  expanded-path IDs, species still carry over; (b) does not scrub other bytes;
  (c) async timing — must gate on "sites loaded" or it transiently blanks a
  valid selection.

- **Clear on logout button only (current — e53d181).** Rejected as incomplete:
  misses every non-button exit (timeout, tab reopen, direct nav), which is why
  the bug still reproduces. A strict subset of the `/login`-mount option.

- **Clear on login submit/success.** Weaker than `/login`-mount: does not scrub
  during the idle gap after an unattended timeout (waits for the next submit),
  and is the "wipe on the way in" shape that reads as a hack.

- **Namespace / guard by `userId` inside `useLocalStorage`.** Rejected: gives
  the _wrong_ behavior for same-user relogin (same id → restores, not fresh);
  also no synchronous source of the id (profile is fetched async), and it
  complicates a hook used in 5+ places.

- **Client-minted session token stamped on each value.** Rejected: it is "clear
  on login" with more machinery — still writes on login, rewrites the
  `useLocalStorage` serialization contract at every call site, _leaves the prior
  user's bytes physically present_ (worse for privacy), and accumulates orphaned
  key sets. A token only pays off when you need to _preserve_ sessions — the
  opposite of the goal.

- **Server-provided per-login session id.** The principled version (a login
  nonce the client stamps storage with; fresh on same-user relogin
  automatically). Rejected for now: crosses the BFF/API boundary and needs
  backend work — overkill for a stale-selector bug.

- **Move filters to URL params + tree state to an in-memory review-layout
  store.** The structurally clean end state: the leak becomes impossible with
  _zero_ cleanup code, filters become shareable, and `useLocalStorage` /
  `StorageKeys` / the logout clear all get deleted. Rejected as the _bug fix_
  (right size for a deliberate refactor, not a patch): ~5–7 files, requires
  threading `activeTab`/`selectedLocation` through the hardcoded
  `<Link href="/review">` back button, and changes tree state to reset on hard
  refresh. Recorded as the intended direction if/when this is refactored
  properly.

- **`sessionStorage`.** Rejected: does not fix the bug — the swap happens in one
  open tab, which `sessionStorage` survives; it only clears on tab close.

## Decision

Chose the `/login` mount clear: a `useEffect` in `LoginForm` removes all
`StorageKeys` on mount, covering the button logout and every server-redirect
logout (timeout, expired-tab reopen, direct nav), since they all land on
`/login`. The `selectedLocation` validation was not taken; it can be added later
as defense-in-depth if leftover non-selector keys prove to matter. The URL +
in-memory-store shape remains the intended long-term architecture but is a
refactor, not this fix.

The logout-button clear (e53d181) is now redundant — left in place, not removed,
as it is harmless and out of this change's scope.

## Consequences

Cleanup lives on the _login screen_, not the logout action — deliberately,
because that is the only client-side point all logout paths (server-detected
timeouts included) share. A future reader must not "fix" this back onto the
logout button; doing so reopens the timeout/tab-reopen/direct-nav leak. Any new
persisted key must be added to `StorageKeys` or it will not be cleared.
