---
name: ai-dev-workflow
description: Use when starting or coordinating code project work across Codex, Claude Code, Antigravity, and GitNexus-style analysis skills, especially when deciding which layer should lead framing, implementation, UI work, or verification.
---

# AI Dev Workflow

## Overview

Do not let one agent do everything.
Use the best layer for framing, the best layer for code truth, the best layer for UI execution, and a separate layer for understanding and review.

## When to Use

Use when:

- starting a new feature
- deciding which tool should lead a task
- coordinating planning, code, and UI work
- avoiding overlap between product framing and implementation
- splitting work across Codex, Claude Code, Antigravity, and GitNexus skills

Do not use for:

- tiny one-file edits with obvious scope
- simple typo fixes
- trivial local changes with no coordination need

## Core Loop

`Codex frame -> Claude Code reality-check + plan -> Claude Code build logic -> Antigravity build/polish UI -> Claude Code verify -> Codex reprioritize`

## By Tool

### Codex = Product / Scope / Planning Layer

Use for:

- feature framing
- scope cutting
- roadmap slicing
- synthesizing feedback and bug themes
- defining the next smallest valuable slice

Owns:

- what to build next

Does not own:

- final code structure
- file-level implementation choices
- technical feasibility without code validation

### Claude Code = Code Truth / Planning / Implementation Layer

Use for:

- reading the real codebase
- impact-aware implementation planning
- backend / logic / refactor work
- debugging
- tests
- verification

Owns:

- what actually changes in code

### Antigravity = Frontend Execution / UI Polish Layer

Use for:

- frontend build-out
- layout work
- interaction polish
- design-heavy pages and flows

Owns:

- UI execution and refinement

Does not own:

- roadmap decisions
- backend architecture
- final technical verification

### GitNexus Skills = Understanding / Impact / Review Layer

Important:

GitNexus here is a skill or capability layer, not the primary builder.

Use for:

- code exploration
- tracing execution flow
- impact analysis
- safe refactoring support
- review support

Owns:

- understanding and safety signals

## By Phase

### Phase A: Frame the Problem

Lead: Codex

Output:

- problem statement
- goals / non-goals
- target flow
- smallest feature slice

### Phase B: Define the Slice

Lead: Codex
Support: Claude Code if technical constraints must be checked early

Output:

- acceptance criteria
- release boundary
- unresolved questions

### Phase C: Reality-Check the Codebase

Lead: Claude Code
Support: GitNexus skills

Output:

- affected files
- technical constraints
- risk list
- implementation surface

### Phase D: Plan Implementation

Lead: Claude Code

Output:

- executable task list
- file paths
- verification steps

### Phase E: Build

#### Logic / Backend / Refactor

Lead: Claude Code

#### Frontend UI / UX

Lead: Antigravity

#### Full-stack coordination

Lead: Claude Code first for flow and interfaces
Then: Antigravity for UI implementation and polish

### Phase F: Verify / Review

Lead: Claude Code
Support: GitNexus skills

Output:

- verification evidence
- regression or risk findings
- next-step recommendation

### Phase G: Reprioritize

Lead: Codex

Output:

- next slice
- defer list
- updated roadmap direction

## Decision Table

| Situation | Lead | Support | Why |
|---|---|---|---|
| Vague feature idea | Codex | - | Best at framing and slicing |
| Need actual files and risks | Claude Code | GitNexus skills | Code truth + impact |
| Backend bug | Claude Code | GitNexus skills | Better debugging loop |
| New frontend page | Antigravity | Claude Code | UI-first execution |
| Full-stack feature | Claude Code | Antigravity | Structure first, UI second |
| Large refactor | Claude Code | GitNexus skills | Safer with impact analysis |
| Decide next slice | Codex | - | Product framing |

## Quick Start

When beginning a real project task:

1. Use Codex to frame the slice.
2. Use Claude Code to check the real codebase.
3. Use Claude Code to write the implementation plan.
4. Use Claude Code for logic-heavy work.
5. Use Antigravity for UI-heavy work.
6. Use Claude Code plus GitNexus skills for review and verification.
7. Return to Codex for reprioritization.

## Common Mistakes

- letting Codex drive final implementation details without code validation
- letting UI work lead before behavior and interfaces are clear
- relying on one agent for framing, coding, UI, and review all at once
- skipping verification because another agent reported success
- using GitNexus skills as the main builder instead of an understanding or review layer
