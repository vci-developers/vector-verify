# 1. Asynchronous per-site DHIS2 Sync Tasks

Date: 2026-06-04

## Status

Accepted

## Context

DHIS2 Submission was implemented as a **synchronous** request: the browser held
`POST /api/dhis2/export` open while the BFF held `POST /dhis2/sync` open until the
whole DHIS2 push finished. DHIS2 push time is highly variable (≈9–35s per site).

A log investigation (June 2026) found the user-facing 504s are generated at the
**Amplify/CloudFront edge**, which cuts off any origin response after ≈28s. The
Elastic Beanstalk backend logged **zero** 504s; it instead logged 499s (the Node
BFF disconnecting) on `/dhis2/sync`. End users are on poor connectivity, which
widens the failure window. Any single site slower than ~28s broke the request
chain and could leave the backend doing orphaned work.

The backend team shipped an **async task API** (`POST /dhis2/sync` returns `202`
with a `taskId`; poll `GET /dhis2/sync/:taskId` or
`GET /dhis2/sync?collectionCycleId=X&siteId=Y`). Task state is **persisted and
shared**, so any VCO can observe tasks started by others. There is **no** batch
read endpoint (no list-by-cycle or list-by-district). The task payload has **no
user/attribution field**. The backend DHIS2 write is **idempotent** (it updates
the previously-issued event id on re-submit rather than creating a new event),
and the backend sets session state `CERTIFIED → SUBMITTED` on task completion.

## Decision

Rewrite the Export feature to drive the async task API:

1. **Keying.** One Sync Task per `(collectionCycleId, siteId)` pair — never
   batched. Data is submitted one site at a time. Sessions with a `null`
   collectionCycleId are **not exportable**; they are shown in an "Unassigned"
   segment and must be assigned to a cycle in Review first.
2. **Reads.** Hydrate shared status with one TanStack Query per `(cycle, site)`
   pair (`GET /dhis2/sync?collectionCycleId&siteId`). Accept the per-pair
   fan-out because no batch endpoint exists.
3. **Polling.** Tiered `refetchInterval`: ~4s while a pair's task is
   `pending`/`running`; no interval for `completed`/`failed`/`timed_out`/idle —
   those refresh on window focus, tab re-entry, manual Refresh, and `staleTime`.
4. **Dedup.** Frontend guard only: block a new Submission while the pair's latest
   task is `pending`/`running`. `completed` stays re-submittable;
   `failed`/`timed_out` retry by starting a fresh task. This is safe (UX, not
   correctness) because the backend write is idempotent.
5. **Status roll-up.** Per-site status combines task status + `result.summary`
   (surface partial failures, `summary.failedSyncs > 0`) + session states
   (`isCertified` vs `isSubmitted`) to distinguish "Ready", "Submitted", and
   "completed but has newly-certified data". Invalidate `sessionKeys` on the
   `running → completed` transition to refresh `SUBMITTED` state.
6. **UI.** A dashboard-style table grouped by collection cycle, with per-row
   Submit/Retry actions and a bulk "Submit selected" action that reuses the IRS
   dialog and fires the async POSTs fire-and-forget. The blocking progress panel
   is removed. Attribution is anonymous (status + relative time) for now.

## Consequences

**Positive**

- Removes the structural cause of the 504: no request approaches the ~28s edge
  cutoff. Slow syncs surface as a `timed_out` *status*, not a gateway error.
- Submission becomes location-invariant: the AWS backend owns the work to
  completion regardless of the browser's connection.
- Shared, persistent task state across VCOs comes "for free" from the API.

**Negative / risks**

- **Per-pair fan-out** for reads — N queries for N sites. Mitigated by the tiered
  polling (only in-flight pairs poll fast) and TanStack caching. Would be a
  single call if the backend later adds a list-by-cycle endpoint.
- **Dedup has a race window** (two VCOs submitting the same pair within the read
  gap). Tolerated only because the backend write is idempotent — if that ever
  changes, dedup must move server-side and this decision should be revisited.
- **No attribution** — the board cannot show who started a task until the backend
  adds a user field.
- Depends on two backend behaviors confirmed by inference, worth one explicit
  confirmation each: the bare `GET ?collectionCycleId&siteId` read form, and
  `SUBMITTED` being set on task completion in async mode.

## Alternatives considered

- **Keep legacy `year/month/district` keying** — rejected; the dedup/poll
  endpoints key on `(cycle, site)`, and the product tracks per-site disposition.
- **Ask backend for a list-by-cycle read endpoint** — deferred; keeps the door
  open but not required to ship. Per-pair reads work today.
- **Backend-enforced dedup / idempotency keys** — unnecessary given the existing
  idempotent DHIS2 upsert.
