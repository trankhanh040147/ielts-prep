# IELTS Writing Prep App v0.1 Design

Date: 2026-04-08
Project repo: `/home/khanh/src/0_github/ielts-prep`
Related notes:
- `10-projects/active/ielts-prep/ideas.md`
- `10-projects/active/ielts-prep/ielts-prep-v0.1-output-2026-04-08.md`

## 1) Goal and scope lock

Ship a web-only IELTS Writing Task 2 demo with one complete practice loop:

1. Choose mode
2. Write
3. Submit for realtime feedback (sentence or paragraph)
4. Revise
5. Save
6. Reload and verify saved history

Locked scope:
- Task 2 only
- Three modes only: thesis drill, paragraph drill, mini essay drill
- 1-1 realtime feedback at sentence/paragraph level
- Revision + save flow
- Local persistence + history list

Out of scope:
- Task 1
- Cloud/auth/sync
- Advanced scoring model and band prediction
- Analytics dashboard
- UI polish and animations

## 2) Architecture

Use a simple two-part local architecture in one repo:

- Frontend: React + Vite + TypeScript SPA
- Backend: tiny Express server with one feedback endpoint (`POST /api/feedback`)

The frontend handles mode selection, prompt display, writing, feedback rendering, revision, save, and history view.
The backend keeps provider credentials on server side and calls Gemini.

### Auth/provider decision

- OpenAI Plus account login is not valid API auth for this app.
- v0.1 uses Gemini API key auth through backend env vars.
- Required secret: `GEMINI_API_KEY`
- Optional config: `GEMINI_MODEL`

Provider-switch support is intentionally deferred to post-v0.1.

## 3) UI components and boundaries

Frontend components:

- `AppShell`: main layout and tab/view switch (`Practice`, `History`)
- `ModePicker`: choose from exactly 3 Task 2 modes
- `PromptCard`: show selected Task 2 prompt from local prompt bank
- `DraftEditor`: textarea for user writing, submit actions for sentence/paragraph checks
- `FeedbackPanel`: render latest structured feedback
- `RevisionActions`: revise and resubmit without losing context
- `SavePracticeButton`: save current draft + feedback, blocked on empty draft
- `HistoryList`: show saved records newest first and reload into editor

Backend modules:

- `feedbackRoute`: request validation + response shaping
- `geminiClient`: calls Gemini API
- `feedbackMapper`: maps model output to stable UI feedback schema

## 4) Data model

```ts
type PracticeMode = 'thesis' | 'paragraph' | 'miniEssay'

type FeedbackUnit = {
  level: 'sentence' | 'paragraph'
  targetText: string
  strengths: string[]
  issues: string[]
  revisionHint: string
}

type PracticeRecord = {
  id: string
  mode: PracticeMode
  prompt: string
  draft: string
  feedback: FeedbackUnit[]
  updatedAt: string
}
```

Local persistence:
- localStorage key: `ieltsPrep.v0.1.history`
- value: `PracticeRecord[]`
- sort order: newest first by `updatedAt`

## 5) End-to-end flow

1. User selects one of 3 modes.
2. App shows a prompt from local Task 2 prompt list.
3. User writes text.
4. User clicks `Check sentence` or `Check paragraph`.
5. Frontend sends `{ mode, level, text, prompt }` to `POST /api/feedback`.
6. Backend requests Gemini feedback and returns normalized `FeedbackUnit[]`.
7. Frontend shows feedback immediately.
8. User revises draft.
9. User saves record.
10. History updates instantly and persists after page refresh.

## 6) Error handling and resilience

- Empty draft save:
  - Save disabled when draft is empty.
  - Inline message: `Writing text is required`.
- Feedback API failure:
  - Preserve draft and current screen state.
  - Show non-blocking error banner.
  - Allow retry submit.
- Invalid model output:
  - Backend attempts normalization.
  - If still invalid, return fallback structured feedback to keep UI stable.

## 7) Mandatory quality gates mapping

1. Feedback appears on sentence/paragraph submit
   - Verified by submit action and visible `FeedbackPanel` update.
2. User can revise after feedback
   - Editor remains enabled after feedback.
3. User can save and reload practices
   - Save writes record; selecting history item reloads draft/feedback.
4. Two sample practices completed and visible in history
   - Manual creation during demo run (not seeded test data).

Additional validation checklist:
- Reject save when writing text is empty.
- Saved practice remains in history after full page refresh.

## 8) Demo evidence contract

Fill output log file:
- `10-projects/active/ielts-prep/ielts-prep-v0.1-output-2026-04-08.md`

Required evidence:
- Run command and local URL
- Two completed practices with:
  - prompt
  - mode
  - feedback sample
  - revision note
- Validation checklist pass/fail
- 60-second demo script completed

## 9) Non-goals and anti-scope drift rules

- No additional modes beyond the three locked modes.
- No scoring rubric expansion or band predictor in v0.1.
- No cloud data, auth system, or sync.
- No dashboard or visual polish sprint.

If a change does not improve the required demo loop or quality gates, defer it.

## 10) Acceptance criteria (definition of done)

v0.1 is done only when all are true:

1. End-to-end loop works: mode -> write -> feedback -> revise -> save.
2. Task 2 only, with exactly 3 modes.
3. Feedback appears after sentence/paragraph submit.
4. Two manually completed practices are saved and visible in history.
5. History is newest first and survives refresh.
6. Output contract document is fully filled with evidence.
