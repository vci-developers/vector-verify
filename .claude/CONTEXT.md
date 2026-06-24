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

**Session**: A single field data collection event at a site, conducted by a VHT
using the VectorCam mobile app. Only sessions of type `SURVEILLANCE` enter the
Review workflow. `collectionCycleId` is nullable — sessions from programs
without a Collection Schedule, or created before a schedule was established,
have no cycle. _Avoid_: Submission, collection event

**Session State**: The lifecycle stage of a Session. In order: `NEEDS_REVIEW` →
`IN_REVIEW` → `CERTIFIED` → `SUBMITTED`. `NOT_APPLICABLE` is set on
non-surveillance sessions (type `CALIBRATION`, `PRACTICE`, `DATA_COLLECTION`)
that never enter the Review workflow.

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
only by **Raw Data Export**; the endpoint can also sign a **Report Export** path,
which is not yet adopted. _Avoid_: Presigned link, temp link, download token

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
