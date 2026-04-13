# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IELTS Writing Task 2 preparation web app (v0.1 demo). Users select a practice mode, write a draft, receive real-time AI feedback (via Gemini), revise, and save — with local history that persists across sessions.

**Status:** Implementation phase. Design spec and plan are finalized in `docs/superpowers/`.

## Monorepo Structure

```
Root (npm workspaces)
├── apps/api       — Express backend: validates requests, calls Gemini, normalizes feedback
└── apps/web       — React + Vite frontend: UI, state, localStorage persistence
```

## Commands

Once the workspace is bootstrapped:

```bash
npm install                          # install all workspaces
npm run dev                          # start both apps in dev mode
npm run test                         # run all tests (both workspaces)
npm --workspace apps/api run test    # API tests only
npm --workspace apps/web run test    # Web tests only
```

Environment: copy `.env.example` to `.env` in `apps/api/` and set `GEMINI_API_KEY`. Optional: `GEMINI_MODEL` (defaults to `gemini-1.5-flash`).

## Architecture

### Data flow

```
ModePicker → PromptCard → DraftEditor
  → POST /api/feedback { mode, level, text, prompt }
  → geminiClient → feedbackMapper → FeedbackUnit[]
  → FeedbackPanel → SavePracticeButton → localStorage → HistoryList
```

### Backend (`apps/api`)

- `feedbackRoute` — Zod-validates request, shapes response
- `geminiClient` — Calls Gemini API, handles JSON parse errors
- `feedbackMapper` — Maps raw Gemini output to stable `FeedbackUnit[]`; provides fallback on invalid model output
- `types.ts` — Shared types: `PracticeMode`, `FeedbackLevel`, `FeedbackUnit`

### Frontend (`apps/web`)

- `App.tsx` — Root: holds mode/draft/feedback/history state
- `promptBank.ts` — Local data: 3 modes × prompts
- `api.ts` — `requestFeedback()` fetch wrapper
- `storage.ts` — `savePractice()` / `loadHistory()` against localStorage key `ieltsPrep.v0.1.history`

### Core types

```typescript
type PracticeMode = 'thesis' | 'paragraph' | 'miniEssay'
type FeedbackLevel = 'sentence' | 'paragraph'
type FeedbackUnit = {
  level: FeedbackLevel
  targetText: string
  strengths: string[]
  issues: string[]
  revisionHint: string
}
type PracticeRecord = {
  id: string; mode: PracticeMode; prompt: string
  draft: string; feedback: FeedbackUnit[]; updatedAt: string
}
```

## Key Design Constraints

- **Scope lock:** Task 2 only, exactly 3 practice modes (`thesis`, `paragraph`, `miniEssay`), no auth/cloud/sync.
- **Error handling:** Empty drafts rejected inline; API failures show a non-blocking retry banner; draft state is preserved on all errors; invalid Gemini output returns fallback structured feedback.
- **Persistence:** All history lives in localStorage — no backend DB.
- **Testing:** Vitest for both workspaces; `@testing-library/react` for components; Supertest for HTTP routes. Follow test-first approach per implementation plan.

## Reference Docs

- Design spec: `docs/superpowers/specs/2026-04-08-ielts-writing-prep-v0.1-design.md`
- Implementation plan (6 tasks): `docs/superpowers/plans/2026-04-12-ielts-writing-prep-v0.1-implementation.md`
- v0.1 scope & definition of done: `docs/ideas.md`
