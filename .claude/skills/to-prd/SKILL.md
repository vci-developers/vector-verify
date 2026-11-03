---
name: to-prd
description:
    Turn the current conversation context into a PRD and publish it to
    .claude/prds/<branch-name>/. Use when user wants to create a PRD from the
    current context.
---

This skill takes the current conversation context and codebase understanding and
produces a PRD. Do NOT interview the user — just synthesize what you already
know.

The issue tracker and triage label vocabulary should have been provided to you —
run `/setup-matt-pocock-skills` if not.

## Voice

Write as a burned-out senior developer who has to build and maintain this:
energy for decisions, none for filler. Tired, not careless.

- Every section earns its place. Short sentences, normal grammar, no preamble,
  no marketing adjectives (robust, seamless, powerful), no restating the section
  heading.
- Specific over vague: name the module, the ADR, the CONTEXT.md term, the count.
  Never "various" or "some".
- Scope to the smallest thing that solves the problem. Check each module against
  the ladder: does it need to exist, already in the codebase, platform feature,
  installed dependency, minimum that works. No speculative abstractions,
  single-use helpers, or one-case config.
- When you check modules and tests with the user, ask once, with the default
  you'll take if unanswered.
- In chat, reply with the PRD path and at most one next step. Don't summarize
  the PRD.

## Output location

PRDs are always written to **`.claude/prds/<branch-name>/<prd-name>.md`**.

- Get the current branch name with `git branch --show-current`.
- Use the branch name as the folder (e.g. `VCV-183-1`).
- Name the file after the feature or ticket (e.g. `VCV-183-export-tab.md`).
- Never write PRDs to a root-level `prds/` folder or anywhere outside
  `.claude/prds/`.

Example path: `.claude/prds/VCV-183-1/VCV-183-export-tab.md`

PRDs should also be batched into commit sized pieces so that they can be easily
reviewed and digested by the engineering team.

## Process

1. Explore the repo to understand the current state of the codebase, if you
   haven't already. Use the project's domain glossary vocabulary throughout the
   PRD, and respect any ADRs in the area you're touching.

2. Sketch out the major modules you will need to build or modify to complete the
   implementation. Actively look for opportunities to extract deep modules that
   can be tested in isolation.

A deep module (as opposed to a shallow module) is one which encapsulates a lot
of functionality in a simple, testable interface which rarely changes.

Check with the user that these modules match their expectations. Check with the
user which modules they want tests written for.

3. Write the PRD using the template below

<prd-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format
of:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

This list of user stories should be extremely extensive and cover all aspects of
the feature. Keep each story to one line, with no padding.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets. They may end up being
outdated very quickly.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not
  implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Commit Plan

Break the implementation into a sequence of small, independently reviewable
commits. Each commit should:

- Do exactly one thing (move a file, change an interface, wire a new component)
- Leave the app in a working state — no broken builds or half-finished features
- Have a subject line that completes the sentence "This commit will…"

Format each entry as:

**Commit N — Title**: One sentence describing the change and why it is
self-contained. List the files touched.

Prefer three to five commits for a typical feature. Resist the urge to batch
unrelated cleanups into the same commit as functional changes.

## Out of Scope

A description of the things that are out of scope for this PRD.

## Further Notes

Any further notes about the feature.

</prd-template>
