# Assignment and handoff templates

These are text templates to copy into an assigned module's documentation, not executable configuration, automatic routes or existing assignments. Replace placeholders with inspected facts. Keep unknowns explicit. Use the existing ES98A curriculum map/plan in place rather than duplicating them.

## Coordinator's four-agent assignment

Only the coordinator edits this ledger. A designated module worker may also be shared integrator.

| Slot | Actual agent | Module     | Base revision/worktree | Exact exclusive paths | Current checkpoint |
| ---- | ------------ | ---------- | ---------------------- | --------------------- | ------------------ |
| A    | Unassigned   | Unassigned | Unassigned             | Unassigned            | Not started        |
| B    | Unassigned   | Unassigned | Unassigned             | Unassigned            | Not started        |
| C    | Unassigned   | Unassigned | Unassigned             | Unassigned            | Not started        |
| D    | Unassigned   | Unassigned | Unassigned             | Unassigned            | Not started        |

Record shared integrator, dirty-baseline handling, preview-port allocation, serial build/browser schedule and ownership transfer procedure. Do not treat these empty rows as a task dispatch.

## Module curriculum map

Record module title/slug, source inventory and full-reading coverage, missing sources, source order, intended reader prerequisites, currently available routes and chapter statuses.

| Chapter / source   | Question and learning objectives | Concepts introduced | Prerequisite result and anchor | New assumptions / notation | Earlier representation to extend | Later use |
| ------------------ | -------------------------------- | ------------------- | ------------------------------ | -------------------------- | -------------------------------- | --------- |
| Fill after reading |                                  |                     |                                |                            |                                  |           |

Add the four ledgers from [module continuity](module-continuity.md): definitions/notation, assumptions, representations, corrections/evidence. Record references to earlier explanations and repeated passages to condense. Include a proposed first pilot and what its review should establish.

## Section and figure plan

| Section                  | Motivating question | Intuition | Formal definition/result/proof | Visual role and placement | Assumptions/invariants | Why static, animated, interactive, or no figure? |
| ------------------------ | ------------------- | --------- | ------------------------------ | ------------------------- | ---------------------- | ------------------------------------------------ |
| Fill from actual content |                     |           |                                |                           |                        |                                                  |

For interactions add initial state, allowed range, what changes, what stays fixed, reader prediction if useful, explicit outcome explanation and keyboard/touch/no-JavaScript behaviour. For fixed sequences state what each panel adds and which scales/labels stay consistent. Do not set a numerical figure quota.

## Checkpoint / module handoff

```text
Module and owner:
Scope authorised by the user:
Base revision and current dirty-state caveat:
Owned paths / shared integrator:
Sources fully read; missing or unread sources:
Current chapter/section and status:

Reader knowledge established so far:
Notation and assumptions to preserve:
Recurring examples/visual conventions and anchors:
Mathematical repairs made, with justification:
Suspected issues still requiring verification:

Changed file manifest:
Routes actually available; registered components:
Pending shared API/style/registration/navigation requests:
Proposed exact shared diff and compatibility implications:
Documentation/gallery/CI discovery changes needed:

Validation commands, date/state, result:
Numerical cases and boundaries tested:
Browser sizes/themes/input modes actually checked:
Screenshot paths and observations:
Untested limitations / known failures:
Editorial assessment independent of UI:
User feedback received (distinguish from agent self-review):

Next exact source/section and intended learning objective:
Outstanding integration or approval boundary:
Commit/checkpoint if one actually exists:
Deployment status:
```

## Ready-for-review checklist

- A fresh reader can follow the motivation → reasoning → result; the exposition is not a list of definitions with decoration.
- Prerequisites, notation and assumptions agree with the curriculum map. Later dependencies are considered.
- Formal results, derivations, qualifications, exercises and references survive; corrections are explicit.
- Each visual answers a question and agrees numerically with prose/formulas. A teaching example is labelled, not presented as empirical evidence.
- Figures have useful static initial content, readable small-screen geometry, visible focus and non-colour cues. Interactive controls have been exercised.
- New APIs are actually registered; routes compile; shared changes were made by the designated owner. No live MDX references an unregistered component.
- New test files were run explicitly and included in CI discovery where appropriate. Build/browser checks ran against the integrated state, not another checkout's server.
- Validation records evidence and limits. No screenshot, test run, user approval, commit or deployment is claimed without having occurred.
- The next agent has a concrete continuation task, ownership boundaries and unresolved questions.
