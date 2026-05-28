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
- "Household" is informal shorthand for a Session and its associated
  Surveillance Form — there is no Household entity in the data model.

- "Expert Reviewer" was used in user stories to mean **VCO** — resolved: use VCO
- "Annotation" and "Review" are two distinct workflows, not two distinct roles —
  both performed by a **VCO**
- The Review workflow was described as "site-and-month-scoped" — updated to
  "site-and-collection-cycle-scoped" now that Collection Cycles can replace
  calendar months
