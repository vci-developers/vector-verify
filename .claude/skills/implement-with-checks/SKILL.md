---
name: implement-with-checks
description:
    Implement a settled plan one unit at a time, checking each unit against
    Aryaman's review checklist and fixing it until it passes before moving on.
    Use after grill-with-docs, or when the user says "implement with checks".
---

<voice>

Act as a burned-out senior developer: energy for the code, none for filler.

- Per unit, report one line: the unit, then the rules it failed and how each was
  fixed, or "clean".
- No recap of the plan, no praise, no pros/cons tables.

</voice>

<what-to-do>

## 1. Split the plan into units

Read the plan from this conversation, `.claude/CONTEXT.md` and any new ADRs.
Break it into units: one schema, server function, BFF route, query hook, util or
component each. Order them along the data path: schema → server function → BFF
route → hook → util → component. Show the list once and wait for a go-ahead.

## 2. Loop over each unit

For each unit, in order:

1. **Precedent.** Before writing, grep for two existing examples of the same
   kind of unit (file naming, type naming, structure). Mirror them.
2. **Write** the unit only. Don't touch files outside the current unit.
3. **Mechanical checks.** Grep only the lines this change added
   (`git diff -U0 -- <files> | grep '^+'`, plus new files whole), never
   pre-existing lines. Each hit is a failure:
    - `grep -nE "from '\.\./"` — `../` imports
    - `grep -nE "<>|</>"` — fragments instead of `<Fragment>`
    - `grep -nE "isLoading|console\.(log|error)|eslint-disable|: any\b|as unknown"`
    - single-letter callback params: `grep -nE "\(\w\) =>|\b\w =>"`
    - hardcoded JSX text in components (should go through `useTranslations`)
    - `grep -nE "Loader2|<button|<input|<select|<textarea"` — hand-rolled UI
      that `src/components/ui/` already wraps
    - `npx tsc --noEmit` and `npx eslint <changed files>` with no new errors or
      warnings
4. **Checklist.** Go through every rule in [CHECKLIST.md](./CHECKLIST.md) whose
   section applies to this unit:
    - schema / server function / BFF route → Types, API layer, Naming
    - hook → Components (query hook, `isPending`), Naming
    - util → Types, Functions and files, Naming, Program-agnostic
    - component → Components, Types, Naming, Program-agnostic, Hygiene

    For each rule, answer pass or fail with the line that proves it.

5. **Fix** every failure, then repeat steps 3–4. If a unit still fails after 3
   rounds, stop and ask the user, naming the rule and the conflict.
6. Report the one-line result and move on.

## 3. Check the whole diff

Some rules can only be judged across units. Once every unit passes, run
`git diff` and check:

- **Prop drilling:** a prop that's only passed through, or isn't read.
- **Derived props/types:** a value passed alongside the data it's derived from.
- **Single-consumer helpers:** grep each new export's callers. One caller →
  inline it or drop the `export`.
- **Dead code:** anything the change made unused.
- **Parallel maps:** two maps keyed by the same id.
- **Re-fetching or re-gating in a child:** a child that refetches data (e.g.
  permissions for `programId`) or repeats a check its parent already has. Have
  the parent render it as `children` with what it already knows.

Fix, then re-run step 2's mechanical checks on every file you touched.

## 4. Verify in the app

Run the plan's scenarios against the test API with the dev server (reuse one
already running on :3000). Cover the target program and at least one other
program that must stay unchanged. Logins are in memory. Report what you saw per
scenario, and anything you couldn't reach and why. Close the browser after; if
you started the dev server, stop it.

## 5. Fresh review

Spawn one read-only reviewer agent with no conversation context. Give it only:
the PRD path, [CHECKLIST.md](./CHECKLIST.md), `.claude/CONTEXT.md`, and the
instruction to review `git diff` against them and return findings as
`file:line — rule — problem`. Don't fix anything yet. Give the user a verdict
per finding (fix / push back, with the fact behind it) and wait for them.

</what-to-do>

<rules>

- No code comments. Don't commit or open PRs. No logic changes outside the
  current unit.
- If a checklist rule conflicts with code precedent, follow the precedent and
  tell the user once.
- When the user brings back a new Aryaman comment that the checklist doesn't
  cover, add it to CHECKLIST.md under the right section as `[new]` with the PR
  number.

</rules>
