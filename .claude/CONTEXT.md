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

**Submission**: The act of a user manually triggering the DHIS2 sync for
certified sessions. Sets state to `SUBMITTED`. Distinct from Certification —
Certification is a review decision; Submission is the export action. _Avoid_:
Export, sync

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

### Forms

**Legacy Surveillance Form**: The fixed-field household survey
(`numPeopleSleptInHouse`, LLIN/IRS fields, …) attached to a Session, used by
programs that have not yet published a Dynamic Form. _Avoid_: Surveillance form
(bare, ambiguous with Dynamic Form data), old form

**Dynamic Form**: A program-scoped, versioned questionnaire built via the Form
API. Each question carries an `answerScope` (`SESSION` or `SESSION_UNIT`) and an
`isUnitIdentityComponent` flag. _Avoid_: Custom form, form builder form

**Form Mode**: Which form structure a program uses — `legacy` (no published
Dynamic Form; sessions carry a Legacy Surveillance Form) or `dynamic` (a
published Dynamic Form exists). Detected at runtime via
`GET /programs/{id}/forms/current` (`not_found` ⇒ legacy); never hardcoded per
program. A program is in exactly one mode at a time: publishing its first form
migrates all legacy answers to Form Answers, so the modes are mutually
exclusive, not coexisting. _Avoid_: Legacy program (as a permanent label —
Uganda will migrate)

**Form Answer**: A single answer value recorded against a Dynamic Form question
for a Session (scope `SESSION`) or a Session Unit (scope `SESSION_UNIT`). Form
Answers are version-bound: publishing a new form version does NOT migrate
answers forward (questions may have been deleted), so a session's answers
permanently belong to the form version they were submitted under. _Avoid_:
Response, submission

**Prerequisite**: An expression tree on a Dynamic Form question — predicates
(`{questionId, operator, value}` with 12 operators) combined via `all`/`any`
groups — that determines whether the question is *answerable* given other
answers. It gates answerability only; it is not validation of the question's
own value. Prerequisites reference questions by id and are independent of the
`parentId` display nesting. _Avoid_: Dependency, condition, skip logic

**Question Type**: One of `text | number | boolean | select | date` — the
value vocabulary of a Dynamic Form question, driving both input widgets and the
operators a Prerequisite may use against it.

**Current-Form Rule (Metadata Review)**: Only Form Answers belonging to the
program's current form are conflict-checked and resolvable; answers from older
form versions render read-only behind an explanatory banner, because the
current form reflects the current state of surveillance. _Avoid_: Version
drift handling (vague)

**Session Unit**: A repeated collection unit within a Session (e.g. one
hour-slot × place combination), carrying its own `SESSION_UNIT`-scoped Form
Answers; specimens may reference the unit they were caught in. _Avoid_: Repeat
group, sub-session

**Unit Identity**: The tuple of a Session Unit's answers to the form's
`isUnitIdentityComponent` questions (e.g. Collection Time + Collection Place).
Units with equal identity across Sessions describe the same real-world
collection context and must agree on non-identity answers; units with
different identities are fundamentally different units and are never compared.
The mobile app guarantees identities are distinct within one Session. _Avoid_:
Unit key, dedupe key

**Metadata Conflict**: A disagreement, within one site + collection cycle
review group, on the same fact — a core Session field across sessions, a
SESSION-scoped Form Answer across current-form sessions, or a non-identity
SESSION_UNIT answer across same-identity Session Units. Resolved by a VCO
choosing one value, applied to every target via the conflict resolution
endpoint. _Avoid_: Discrepancy, mismatch

### Exports & Developer Tooling

**Report Export**: The polished, cleaned `.xlsx` a VCO downloads from the
Operations page, scoped to the selected location and date range. Audience:
health officers. _Avoid_: Export (alone, ambiguous — see Flagged ambiguities)

**Raw Data Export**: A `devMode`-gated download of unprocessed CSVs straight
from the backend (specimens, surveillance forms, annotations), not affected by
the Operations filters — the raw data for the user's own program (Specimens is
surveillance-only, with inference results), for engineers, not a report. Lives
in the global user menu, not the Operations page. Audience: developers. _Avoid_:
Raw export (capitalise), DB dump, backup

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
