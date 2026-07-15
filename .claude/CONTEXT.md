# VectorVerify

VectorVerify is the web-based review, annotation, and monitoring platform for
the VectorCam mosquito surveillance ecosystem. It transforms raw field data
collected by VHTs into validated, certified surveillance intelligence ready for
national health systems.

## Language

### Roles

**VHT (Village Health Team)**: A field data collector who captures mosquito
specimens and household survey data using the VectorCam mobile app. VHTs do not
access VectorVerify directly. _Avoid_: Collector, field worker, field team

**VCO (Vector Control Officer)**: An authorized expert (Access Level 3) who
performs both the Annotation and Review workflows in VectorVerify. _Avoid_:
Expert reviewer, annotator, program editor, supervisor

### Access & Authorization

**Whitelisted**: An account state (`user.isWhitelisted`) meaning a program
administrator has approved the user for VectorVerify access. A logged-in user
who is not yet whitelisted is _awaiting approval_ and can reach no feature page.
_Avoid_: Approved, enabled, active (distinct from `isActive`)

**Access Denial**: The single `/forbidden` page covers two distinct situations,
distinguished by a cosmetic `?reason=` param (UX only — real access control is
enforced server-side in each route's layout, never by this param):

- **Pending approval** (`reason=not-whitelisted`): logged-in but not yet
  whitelisted; no feature is reachable, so the only action is Logout.
- **No access** (default — no `reason` param): a whitelisted user who lacks the
  privilege for a specific feature (Annotation / Operations / Review); offered a
  link home (`/`) plus Logout as a fallback. Any unrecognized `reason` also
  falls through to this state.

_Avoid_: Forbidden (alone, ambiguous between the two reasons)

### Workflows

**Annotation**: A task-based workflow in which a VCO labels mosquito specimens
(species, sex, abdomen status) to evaluate and improve ML model performance.
Distinct from Review. _Avoid_: Expert review, labeling

**Review**: A site-and-collection-cycle-scoped workflow in which a VCO validates
surveillance data quality and certifies it for submission to national health
systems. Distinct from Annotation. _Avoid_: Data review (ambiguous), QA

**Review Unit**: The atomic scope a VCO certifies or resolves conflicts within —
exactly one **Sentinel Site** paired with exactly one **Collection Cycle**. For
programs with no Collection Schedule (no cycles), the unit falls back to one
**Sentinel Site** paired with one **calendar month**. The Review date filter
(`startDate`/`endDate`) only selects which Cycles or months are _listed_; it
never widens a unit to span multiple Cycles or months. A VCO can never certify
or resolve a conflict across more than one Review Unit at a time. Mirrors the
**Sync Task** key (`collectionCycleId, siteId`). _Avoid_: site-month, period,
batch, the selected range (as a unit)

### Core Entities

**Program**: The top-level organizational unit. All sites, users, sessions, and
forms belong to a program.

**Site**: A node in the program's location hierarchy (e.g. district → parish →
village). Sites form a tree via a self-referencing parent. _Avoid_: Location,
household

**Sentinel Site**: A site at the leaf of the location hierarchy where mosquito
collection actually occurs (`has_data = true`). The term is used in the web app
UI; the API calls these "leaf sites". _Avoid_: Leaf site (in UI-facing language)

**Collection Schedule**: The program-level pattern that governs how Collection
Cycles are generated. One active schedule per program at any time. Two modes:
`RECURRING` (auto-generates cycles at a fixed interval, e.g. every 2 months) and
`MANUAL` (cycles are created explicitly by an authorized user). Changing a
schedule ends the current one and starts a new one. _Avoid_: Cadence, frequency
setting

**Collection Cycle**: A concrete time window (startDate → endDate) generated
from a Collection Schedule, used to group Sessions for Review and reporting.
Replaces the default calendar-month grouping. Cycles are program-scoped — all
sites in a program share the same schedule. A session whose collection date
falls outside any cycle window can be manually re-assigned to an adjacent cycle
by a VCO during Review (the exception case). Note: adoption is not yet universal
— programs without a Collection Schedule, or sessions created before one was
established, produce sessions with no cycle assignment. _Avoid_: Reporting
period, month (when a custom cycle is in use)

**Timezone**: The IANA timezone name (e.g. `Africa/Kampala`) used to display
Session collection dates and Collection Cycle windows in the region where
collection happened — never the reviewer's browser timezone. Owned by the
**Collection Schedule** and denormalized onto every **Collection Cycle** it
generates. Because a Schedule is program-scoped with only one active per program
(and all a program's sites share it), **a Site is governed by exactly one
timezone at a time** — a single Site whose Sessions span two timezones is a data
error, not a valid state. The value is unvalidated free text on the backend and
may be `null` (cycles predating the column, or schedules with no timezone); the
web app falls back to UTC for display when it is `null`. Timezone is
**display-only**: which Cycle a Session belongs to is decided by the backend as
a raw instant comparison (`cycle.startDate <= collectionDate < cycle.endDate`)
and is timezone-independent — the frontend timezone can never move a Session
between Cycles, only change the calendar day a `collectionDate` is _rendered_
as. (The backend exposes no get-single-cycle endpoint and Sessions carry no
timezone of their own — it lives only on the Cycle.) _Avoid_: browser timezone,
local time, offset

**Session**: A single field data collection event at a site, conducted by a VHT
using the VectorCam mobile app. Only sessions of type `SURVEILLANCE` enter the
Review workflow. `collectionCycleId` is nullable — sessions from programs
without a Collection Schedule, or created before a schedule was established,
have no cycle. _Avoid_: Submission, collection event

**Session State**: The lifecycle stage of a Session. In order: `NEEDS_REVIEW` →
`IN_REVIEW` → `CERTIFIED` → `SUBMITTED`. `NOT_APPLICABLE` is set on
non-surveillance sessions (type `CALIBRATION`, `PRACTICE`, `DATA_COLLECTION`)
that never enter the Review workflow. _Avoid_: `IN_PROGRESS` (used loosely in
tickets to mean `IN_REVIEW` — there is no `IN_PROGRESS` state).

**Site Review State**: The single state badge shown on a Sentinel Site row in
the Review sites list, derived per Review Segment by `getSiteOverallReviewState`
as the **most severe unresolved** state across that site's sessions in the
segment — the first non-zero count walking
`NEEDS_REVIEW → IN_REVIEW → CERTIFIED → SUBMITTED`. So one un-reviewed session
drags a mostly-certified site back to **Needs Review**; **Certified** means
"nothing left to review here, not yet fully in DHIS2"; **Submitted** means fully
shipped. A site with no sessions in the segment has no Site Review State (shows
"No Sessions"). This derived value — not the individual session counts — is what
the **State filter** matches against. _Avoid_: site status, badge state.

**State Filter**: A Review sites-list filter (multi-select, empty = show all,
mirroring the Collection Cycle picker) over the four **Site Review State**
values. A Sentinel Site row is shown when its Site Review State is in the
selected set; no-session rows are hidden whenever any state is selected.
Filtering hides non-matching leaf rows and prunes location groups that end up
with zero matching leaves; it never hides a **Collection Cycle** segment (an
emptied cycle still renders, so its count badge can report a zero). Group
coverage stats (visited/ total and the %/tint) stay **filter-blind** — they
measure collection coverage of the location, a fixed property, not the filtered
subset. To keep coverage filter-blind, the site hierarchy always receives the
**full** `sites` array (coverage denominators walk the full tree) and a separate
`visibleSiteIds` set threaded to the leaf rows decides which rows render — the
hierarchy must never be handed a pre-filtered `sites` array, because its group
coverage counts are derived from whatever array it is given. _Avoid_: status
filter; pre-filtering `sites` before the hierarchy (collapses coverage
denominators to the visible subset, e.g. 2-of-2-100% instead of 2-of-20-25%).

**Filtered-Sites Count Badge**: The "Showing X of \<total\> sites" badge on a
segment header in the Review sites list. Renders on **any** segment header —
Collection Cycle **or** calendar month — because both segment kinds share one
header component. Shown **only while the State Filter is active**. `X` =
Sentinel Site rows currently visible in that segment under the filter
(filter-aware numerator); `total` = every Sentinel Site (leaf site) in the
selected location, counted **structurally** — the same leaf definition the group
coverage badge uses, so the header `total` and the group `total`s reconcile.
Legacy/Uganda: the `sites` array is already leaf-level (each row is a full
house), so `total` = `sites.length`. Hierarchical/non-Uganda: `sites` flattens
every tree level together, so the leaves are the rows nobody points to as a
`parentId` — `sites.filter(s => !parentIds.has(s.siteId))`. This is a **wider,
location-spanning** denominator than the group "of Y" (which counts leaves under
one group), independent of the segment, never shrinks with the filter.
Per-segment display, never aggregated across segments. Follows the Gmail/GOV.UK
"X of Y" convention: numerator moves, denominator holds still. _Avoid_: showing
it at 25-of-25 when no filter is active; a filter-relative denominator; using
`hasData` for `total` (that counts only ever-visited leaves, so it undercounts
the never-visited "No sessions" rows the list still renders, and disagrees with
the structural group totals).

**Session Unit**: A repeated collection sub-unit within a single Session (e.g. a
trap or room visited within one household visit), fetched via
`GET /sessions/{id}/units`. Carries only
`{ id, sessionId, frontendId, unitOrder }` — it has **no intrinsic semantic
identity fields**. The mobile app guarantees distinct units within one Session.
Session Units exist only under **Dynamic Form** programs (legacy/surveillance
programs have none). _Avoid_: sub-session, repeat, group

**Form Mode**: Which form system a Program uses — **exclusive per program**.
**Surveillance Form** (legacy, e.g. Uganda): a fixed-schema form
(`GET /sessions/{id}/surveillance-form`) with a hardcoded field set. **Dynamic
Form**: a versioned, admin-defined question set
(`GET /programs/{id}/forms/current`); answers via
`GET /sessions/{id}/forms/answers`. Mode is detected by the current-form
endpoint — `not_found` ⇒ Surveillance/legacy — **never by hardcoding country**.
A program is in exactly one mode at a time. _Avoid_: custom form, legacy vs new
(when precision matters)

**Form Answer Scope**: A Dynamic Form question's `answerScope`, either `SESSION`
(one answer per Session) or `SESSION_UNIT` (one answer per Session Unit).
Determines which target ids a **Metadata Conflict** resolves against —
`sessionIds` for `SESSION`, `sessionUnitIds` for `SESSION_UNIT`.

**Unit Identity**: The set of a Session Unit's `SESSION_UNIT`-scoped answers
whose question is flagged `isUnitIdentityComponent: true`. Their combined values
**identify** the unit and are used to match the "same" unit across Sessions in a
Review Unit (group by the identity-value tuple). Identity components are shown
as the unit's **header/title**, never as resolvable conflict rows. Non-identity
`SESSION_UNIT` answers are the resolvable rows. _Avoid_: unit key, unit name

**Metadata Conflict**: A field/question that holds differing values across the
Sessions (or matched Session Units) of one **Review Unit**, which a VCO must
resolve to a single agreed value before Certification, via
`POST /sessions/conflicts/resolve`. `SESSION`-scoped conflicts (core session
fields, surveillance-form fields, session-scoped dynamic answers) resolve with
`sessionIds`; `SESSION_UNIT`-scoped conflicts resolve with `sessionUnitIds`, one
call per **Unit Identity** group. _Avoid_: discrepancy, mismatch

**Certification**: The act of a VCO marking a reviewed session as complete and
ready for DHIS2 submission. Sets state to `CERTIFIED`. _Avoid_: Approval,
sign-off

**Submission**: The act of a user manually triggering the DHIS2 sync for a
site's certified sessions. Distinct from Certification — Certification is a
review decision; Submission is the export action. Submission is **asynchronous**
and **per-site**: the user starts it, the backend runs a **Sync Task** to
completion on AWS, and `SUBMITTED` state is reached only when that task reports
`completed` (not at task creation). _Avoid_: Export, sync, upload

**Sync Task**: The asynchronous backend job that carries out one **Submission**.
A Sync Task is keyed by exactly one `(collectionCycleId, siteId)` pair — data is
always submitted one site at a time, never batched. It is started with
`POST /dhis2/sync`, which returns a `taskId` immediately; the frontend then
polls `GET /dhis2/sync?collectionCycleId&siteId` for status. The backend owns
the task end-to-end and persists it, so any VCO can observe tasks started by
others. A Sync Task moves through `pending` → `running` → `completed` | `failed`
| `timed_out` (work is capped at 300s before `timed_out`). _Avoid_: Job (the
original investigation used `sync-jobs`; the shipped API uses task/`taskId`)

Re-submission of a `completed` site is intentionally allowed: the backend sync
is **idempotent** — on re-submit it updates the previously-issued DHIS2 event id
rather than creating a new event, so pushing sessions certified after the first
run is safe. The only states that lock a site against a new Submission are
`pending` and `running` (an in-flight task); `failed`/`timed_out` are retried by
starting a fresh task. Because of this idempotency the frontend dedup guard is a
UX/efficiency measure, not a correctness boundary.

**Specimen**: A single captured mosquito associated with a session. _Avoid_:
Sample, mosquito

**Annotation Task**: A curated set of specimens assigned to a VCO for
Annotation. _Avoid_: Task (alone, ambiguous)

**Morph Classification**: The label a VCO assigns to a specimen based on
physical morphology (e.g. wing venation, structural features). One of two
classification types recorded per annotation. _Avoid_: Morphological

**Visual Classification**: The label a VCO assigns based on direct visual
inspection of the specimen image. One of two classification types recorded per
annotation. _Avoid_: Image-based

### Exports & Developer Tooling

**Report Export**: The polished, cleaned `.xlsx` a VCO downloads from the
Operations page, scoped to the selected location and date range. Audience:
health officers. _Avoid_: Export (alone, ambiguous — see Flagged ambiguities)

**Device**: A physical Android phone running the VectorCam mobile app, used by a
VHT to capture sessions in the field. Registered per program (`GET /devices/`)
with `deviceId`, `model`, `registeredAt`, `submittedAt`. Every device in the
program is a field device — VCOs never use devices, so there is no "VCO device".
A session carries the producing `deviceId` (FK) plus a free-text
`collectorName`; there is **no device→user link**, so device activity is the
only robust proxy for field-collector activity. UI label is always "Devices",
never "Users". _Avoid_: User, phone, handset (in UI-facing language)

**Device Activity**: A device's status derived entirely from the sessions it
produced — **never** from the device registry (`GET /devices/`), which has no
location. A device "belongs" to a location only through its sessions' `siteId`s,
so activity is computed from `/sessions/` grouped by `deviceId` and scoped to
the selected location's sites, exactly like Unique Sites. Activity is measured
by **rolling calendar months**, not collection cycles — the same model for every
program, so the device view is consistent whether or not a program has a
Collection Schedule. The location's device **universe** = devices with ≥1
session at a site in the selected location over the last **6 calendar months**.
Three location-scoped tiers, which reconcile to that universe: **Active**
(submitted in the location in the current month), **Lapsing** (submitted in the
location within the last 3 months, not the current month), **Inactive** (in the
6-month universe but no session in the last 3 months — "used to collect here,
went quiet"). Shown as headline cards for the selected location; in the map's
Devices view, markers are keyed by `siteId` and encode size = active device
count, color = site health (active vs lapsing). Activity is always evaluated
**as-of-today**, independent of the page's month filter. _Avoid_:
Online/offline, connected

**Raw Data Export**: A `devMode`-gated download of unprocessed CSVs straight
from the backend (specimens, surveillance forms, annotations), not affected by
the Operations filters — the raw data for the user's own program (Specimens is
surveillance-only, with inference results), for engineers, not a report. Lives
in the global user menu, not the Operations page. Audience: developers.
Delivered as a temporary, expiring **Signed Export URL** (obtained via
`POST /export/sign`) that the developer clicks to download directly from the
backend — VectorVerify signs the request but no longer proxies the CSV stream.
_Avoid_: Raw export (capitalise), DB dump, backup

**Signed Export URL**: A short-lived, pre-signed URL returned by
`POST /export/sign` (`{ url, expiresAt }`) granting temporary _unauthenticated_
access to an export (or report) path served directly by the backend. The browser
downloads from it directly, bypassing VectorVerify's BFF proxy. Currently used
only by **Raw Data Export**; the endpoint can also sign a **Report Export**
path, which is not yet adopted. _Avoid_: Presigned link, temp link, download
token

**Developer Mode**: An elevated client capability carried as
`permissions.devMode` on the user permissions payload, unlocking developer-only
features (currently just the Raw Data Export). When on, a "Developer Mode" badge
shows in the user menu. _Avoid_: Debug mode, admin mode, dev flag

## Relationships

- A **Program** contains many **Sites**
- A **Site** hosts many **Sessions**
- A **Session** contains many **Specimens**
- A **Session** optionally belongs to one **Collection Cycle**; sessions from
  programs without a Collection Schedule, or created before a schedule was
  established, have no cycle
- A **Specimen** belongs to exactly one **Session**
- An **Annotation Task** contains many **Specimens** drawn from across sessions
- A **VCO** performs **Annotation** (via Annotation Tasks) and **Review** (via
  the Review workflow)
- A **VHT** creates **Sessions** and **Specimens** via the VectorCam mobile app

## Flagged ambiguities

- "Sentinel site" (web app doc language) and "leaf site" (API code language)
  refer to the same concept — a site with `has_data = true`. Use "Sentinel Site"
  in UI-facing contexts.
- "Household" is informal field language for a **Sentinel Site** — the physical
  house (leaf node in the location hierarchy) where a VHT collects specimens. A
  Sentinel Site can have multiple Sessions in a cycle. Use "Sentinel Site" in
  code and UI-facing language; avoid "household".

- "Expert Reviewer" was used in user stories to mean **VCO** — resolved: use VCO
- "Annotation" and "Review" are two distinct workflows, not two distinct roles —
  both performed by a **VCO**
- The Review workflow was described as "site-and-month-scoped" — updated to
  "site-and-collection-cycle-scoped" now that Collection Cycles can replace
  calendar months
- "Export" is overloaded three ways: the glossary already steers it away from
  **Submission** (the DHIS2 sync). It is also the visible label on the
  Operations download button ("Export Data") — that is a **Report Export**. The
  new CSV dump is a **Raw Data Export**. Use the qualified two-word terms; never
  "Export" bare.
