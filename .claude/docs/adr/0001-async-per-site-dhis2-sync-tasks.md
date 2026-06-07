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
   collectionCycleId are **not exportable** and are **not rendered on the DHIS2
   dashboard at all** — assigning a session to a cycle is a Review concern (the
   sites-list already has its own "Unassigned" segment for that), not a job of
   this board. The dashboard groups only cycle-assigned sessions. A site that
   *also* holds any unassigned session is gated from submission **entirely**:
   every `(cycle, site)` Submit for that site is hard-blocked until the orphaned
   sessions are assigned, so a site's DHIS2 data is never pushed while part of
   its data sits outside any cycle. The gate is a site-level frontend guard
   (input: "does this site have ≥ 1 unassigned session?"), independent of the
   per-row sync status — it is **not** a value of the status roll-up union, and
   `unassigned` is therefore **not** a member of that union. The
   assign-orphan-to-cycle flow that clears the gate is a **separate, forthcoming
   feature, out of scope for this rewrite**.
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
   (a `completed` task with `summary.failedSyncs > 0` = the single household was
   rejected → rolled up to **Failed**; per-site tasks are one household, so there
   is no partial "completed with errors" state) + session states
   (`isCertified` vs `isSubmitted`) to distinguish "Ready", "Submitted", and
   "completed but has newly-certified data". Invalidate `sessionKeys` on the
   `running → completed` transition to refresh `SUBMITTED` state.
   **Incremental data / review-pending.** Field data arrives over time, so a site
   can gain a new, un-reviewed, in-cycle session after it was certified or even
   submitted. The board therefore renders a site when it **has submittable data**
   (`certifiedCount + submittedCount > 0`), not only when fully locked — otherwise
   a submitted site silently vanishes the moment new data lands. A rendered site
   that is **not** fully reviewed (`!isSiteLocked`) rolls up to **`reviewPending`**
   ("Review needed"): one un-certified-new-data status (distinct from
   *certified*-new-data "has new data to submit"), which **hard-gates submit** —
   the second submission gate alongside the unassigned-session gate of §1. Unlike
   that gate, this one **is** a member of the status union (it is a visible badge,
   not a silent block). This also motivates representing the per-site session
   summary as **per-state counts** rather than seeded-`true` AND-fold booleans, so
   "has *any* certified/submitted" is expressible.
   > **Superseded by [Step 11d](../../prds/VCV-225/VCV-225-11d-submission-board-only.md):**
   > the board became **submission-only**. The appear-gate tightened from "has
   > submittable data" to **`isSiteFullyReviewed`**, and **`reviewPending` was removed
   > from the status union** — a not-fully-reviewed site no longer appears on the board
   > at all (review is resolved in the Review tab first), so there is no on-board
   > review-pending badge or second submit-gate. The per-state-counts representation
   > this paragraph motivated **remains** the design.
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
- **The unassigned-session gate depends on an unbuilt flow.** A site with any
  unassigned session is blocked from all submission, but the assign-to-cycle
  capability that clears the block does not exist on the frontend yet (session
  `collectionCycleId` is read-only today — no mutation sets it). Until that
  separate feature ships, an orphaned site cannot be submitted at all. Accepted
  deliberately: data completeness outranks export availability, and the
  assignment flow is expected soon.
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
