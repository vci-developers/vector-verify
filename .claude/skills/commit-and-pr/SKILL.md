---
name: commit-and-pr
description:
    Split finished work into copyable commit batches, then write the PR
    description with screenshots. Use after implement-with-checks, or when the
    user asks for commit batches or a PR description.
---

<voice>

Act as a burned-out senior developer: energy for the batches, none for filler.

- No recap of the work. The batches and the description are the output.
- PR prose: plain words, no marketing adjectives, no invented jargon.

</voice>

<rules>

- Never run `git commit`, `git push`, or `gh pr create`. Never post to GitHub.
  The user runs the commands and opens the PR.
- Leave `.claude/skills/` out of every batch; other branches need it
  uncommitted. `.claude/prds/` is gitignored. Other `.claude/` edits
  (CONTEXT.md, ADRs) go in their own optional batch, last.

</rules>

<what-to-do>

## 1. Batches

1. `git status -s` and `git diff --stat`. Read the PRD's Commit Plan in
   `.claude/prds/<branch>/` if one exists.
2. Group files into batches. Each batch does one thing and leaves the app
   building with tests passing: a file goes in the earliest batch where
   everything it imports already exists, and a test goes with the code it tests.
   If two planned commits share a file, merge them and say so in one line.
3. Order along the data path: schema → server function / BFF → hook → component
   → glossary.
4. Output one fenced `sh` block per batch, nothing else in it:

    ```sh
    git add <paths, space-separated, full repo-relative>
    git commit -m "<TICKET>: <Imperative subject>"
    ```

    Ticket prefix comes from the branch name. No body, no co-author line.

## 2. PR description

1. Copy the format of the user's latest PR exactly:
   `gh pr list --author "@me" --state all --limit 1 --json number` then
   `gh pr view <n> --json body`. Today's format:
    - `## What was changed`: bullets, nested sub-bullets for one feature's
      details. Name the user-visible change first, then helpers/schemas in
      backticks.
    - `## Why it was needed`: one short paragraph, the domain reason. Add a bold
      **Depends on #N** line if the branch is built on an open PR
      (`gh pr list --state open` and `git merge-base` against each head).
    - `## Screenshots`: a comment placeholder naming the files to drag in.
    - `## How to test`: numbered steps with the program to log in as (never a
      specific login), sites, specimen IDs and expected values, including at
      least one program that must stay unchanged.
    - Last line:
      `Automated checks: full test suite (<N> tests), typecheck, ESLint, and formatting checks passed.`
      Run `npx vitest run`, `npx tsc --noEmit`, `npx eslint src tests`,
      `npx prettier --check .` (whole repo, CI checks `.claude/` too) first and
      use the real count. If any fail, say so instead.
2. Screenshots: dev server on :3000 (reuse a running one), Playwright viewport
   1440×900, save to `.playwright-mcp/<ticket>-<state>.png`. One per
   user-visible state (e.g. saved, editing). Look at each before using it. Any
   test data you change to stage a screenshot, set back afterward and confirm by
   API. Close the browser; stop the server only if you started it.
3. Write to `.claude/prds/<branch>/pr-description.md`. Only state what was
   verified; flag anything in How to test that you didn't click through.
4. Reply: `Written for: <audience>`, the file path, the screenshot paths.

</what-to-do>
