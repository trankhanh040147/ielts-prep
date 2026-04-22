# Topic Management — Design Spec

**Date:** 2026-04-22
**Feature:** v0.3 — Topic picker + editable topic names in history
**Scope:** `apps/api` (new route) + `apps/web` (new component, data model, history edit).

---

## Overview

Replace the current single static prompt per mode with a topic picker that offers:
1. **Quick-pick chips** — 4 pre-made IELTS Task 2 prompts per mode, selectable as chips
2. **AI Generate** — a "Generate new…" button that calls a new backend endpoint, gets a fresh prompt + a short topic name from Gemini
3. **Editable session name** — an inline text field showing the current topic name, always editable before saving
4. **History rename** — clicking a topic name in the history list turns it into an inline input; blur or Enter saves the new name to localStorage

---

## File Change List

| Action | File |
|---|---|
| Modify | `apps/api/src/index.ts` |
| Create | `apps/api/src/routes/topicRoute.ts` |
| Create | `apps/api/src/__tests__/topicRoute.test.ts` |
| Modify | `apps/web/src/types.ts` |
| Modify | `apps/web/src/lib/promptBank.ts` |
| Create | `apps/web/src/lib/topicApi.ts` |
| Modify | `apps/web/src/lib/storage.ts` |
| Create | `apps/web/src/components/TopicPicker.tsx` |
| Modify | `apps/web/src/App.tsx` |
| Modify | `apps/web/src/components/HistoryList.tsx` |
| Modify | `apps/web/src/components/SavePracticeButton.tsx` |
| Create | `apps/web/src/__tests__/TopicPicker.test.tsx` |
| Modify | `apps/web/src/__tests__/HistoryList.test.tsx` |

---

## Data Model

### `types.ts` — shared types

Add `topicName` to `PracticeRecord`:

```ts
type PracticeRecord = {
  id: string
  mode: PracticeMode
  prompt: string
  topicName: string      // ← new field
  draft: string
  feedback: FeedbackUnit[]
  updatedAt: string
}
```

Add `TopicResponse` for the new API endpoint:

```ts
type TopicResponse = { prompt: string; topicName: string }
```

### `promptBank.ts` — expanded bank

Each entry becomes `{ prompt: string; topicName: string }`. 4 entries per mode.

```ts
export const PROMPT_BANK: Record<PracticeMode, { prompt: string; topicName: string }[]> = {
  thesis: [
    { prompt: 'Some people think governments should spend money on railways rather than roads. Discuss both views and give your opinion.', topicName: 'Railways vs Roads' },
    { prompt: 'Some people believe that unpaid community service should be a compulsory part of high school programmes. To what extent do you agree or disagree?', topicName: 'Compulsory Community Service' },
    { prompt: 'Some argue that the best way to reduce crime is to give longer prison sentences. Others believe there are better methods. Discuss both views and give your opinion.', topicName: 'Crime & Prison Sentences' },
    { prompt: 'Many people think that social media has had a largely negative effect on society. To what extent do you agree or disagree?', topicName: 'Social Media Impact' },
  ],
  paragraph: [
    { prompt: 'Many believe online education is replacing traditional classrooms. To what extent do you agree or disagree?', topicName: 'Online Education' },
    { prompt: 'Some people think that a sense of competition in children should be encouraged. Others believe it is harmful. Discuss both views and give your opinion.', topicName: 'Competition in Children' },
    { prompt: 'It is often argued that zoos are cruel and should be abolished. To what extent do you agree or disagree?', topicName: 'Zoos: Cruel or Beneficial?' },
    { prompt: 'Some people think that physical exercise should be compulsory for all school students every day. Others disagree. Discuss both views and give your opinion.', topicName: 'Compulsory PE in Schools' },
  ],
  miniEssay: [
    { prompt: 'In many countries, young people are moving to cities. What are the causes and effects?', topicName: 'Youth Migration to Cities' },
    { prompt: 'In many countries the number of animals and plants is declining. Why is this happening? How can this issue be addressed?', topicName: 'Declining Biodiversity' },
    { prompt: 'Many people are working longer hours than ever before. What are the reasons for this? What effect does it have on individuals and society?', topicName: 'Overworking Trend' },
    { prompt: 'The number of people who are overweight is increasing in many countries. What are the causes of this? What measures could be taken to address this?', topicName: 'Global Obesity' },
  ],
}
```

### `storage.ts` — migration fallback

In `loadHistory()`, map records missing `topicName` with a fallback derived from the prompt:

```ts
function fallbackTopicName(prompt: string): string {
  const words = prompt.split(' ').slice(0, 6)
  return words.join(' ') + (prompt.split(' ').length > 6 ? '…' : '')
}

// Inside loadHistory, after JSON.parse:
return records.map((r) => ({
  ...r,
  topicName: r.topicName ?? fallbackTopicName(r.prompt),
}))
```

Add `renameRecord(id: string, newName: string): PracticeRecord[]` — loads history, updates the matching record's `topicName`, saves back, returns updated array.

---

## Backend

### `apps/api/src/routes/topicRoute.ts`

```
POST /api/topic
Body: { mode: PracticeMode }
Response: { prompt: string; topicName: string }
```

- Zod-validates request body: `{ mode: z.enum(['thesis', 'paragraph', 'miniEssay']) }`
- Calls `geminiClient.generateTopic(mode)` — a new method on the existing client
- `generateTopic` sends a Gemini prompt asking for a JSON response: one IELTS Task 2 question appropriate for the mode, plus a short topic name (≤5 words)
- If Gemini returns invalid JSON, returns a hardcoded fallback defined inside `topicRoute.ts` — one safe default prompt + topicName per mode (not imported from the frontend)
- Wired in `index.ts` alongside the existing feedback route

### Gemini prompt for topic generation

```
Generate one IELTS Academic Writing Task 2 question for the practice mode: "${mode}".
Respond with JSON only, no explanation: { "prompt": "<full question>", "topicName": "<max 5 words>" }
The topicName should be a short label suitable for a history list entry.
```

---

## Frontend

### `apps/web/src/lib/topicApi.ts`

```ts
async function generateTopic(mode: PracticeMode): Promise<TopicResponse>
```

Calls `POST /api/topic`, throws on non-2xx, returns `{ prompt, topicName }`.

### `apps/web/src/components/TopicPicker.tsx`

Props:
```ts
interface TopicPickerProps {
  mode: PracticeMode
  prompt: string        // current prompt — needed to call onTopicChange from name field
  topicName: string
  onTopicChange: (prompt: string, topicName: string) => void
}
```

UI elements:
- **Chip strip** — one chip per `PROMPT_BANK[mode]` entry, labelled with `topicName`. Active chip (matching current `topicName`) styled indigo; others slate. Clicking a chip calls `onTopicChange(entry.prompt, entry.topicName)`.
- **Generate button** — labelled "✨ Generate new…". On click: sets local `generating: boolean` to true, calls `generateTopic(mode)`, on success calls `onTopicChange(result.prompt, result.topicName)`, on error shows an inline error message (non-blocking, dismissible). Resets `generating` in finally.
- **Session name field** — `<input>` showing `topicName`. `onChange` calls `onTopicChange(currentPrompt, newName)` passing the current prompt unchanged and the new name.

### `apps/web/src/App.tsx` — state changes

```ts
// Replace:
const prompt = PROMPT_BANK[mode][0]

// With:
const [prompt, setPrompt] = useState(PROMPT_BANK['thesis'][0].prompt)
const [topicName, setTopicName] = useState(PROMPT_BANK['thesis'][0].topicName)

function handleTopicChange(newPrompt: string, newTopicName: string) {
  setPrompt(newPrompt)
  setTopicName(newTopicName)
}

// In handleModeChange, reset to first entry of new mode:
setPrompt(PROMPT_BANK[newMode][0].prompt)
setTopicName(PROMPT_BANK[newMode][0].topicName)
```

Pass `topicName` to `SavePracticeButton`. Render `<TopicPicker>` above `<PromptCard>` in the left column.

Add `handleRenameRecord(id: string, newName: string)`:
```ts
function handleRenameRecord(id: string, newName: string) {
  setHistory(renameRecord(id, newName))
}
```
Pass to `HistoryList`.

### `apps/web/src/components/SavePracticeButton.tsx`

Add `topicName: string` to props. Include it when building the `PracticeRecord` to save.

### `apps/web/src/components/HistoryList.tsx`

- Add prop `onRename: (id: string, newName: string) => void`
- Each row shows `record.topicName`
- Local state `editingId: string | null` tracks which row is in edit mode
- Clicking the name text sets `editingId = record.id`
- While editing: renders `<input>` with the current name, `autoFocus`, `onBlur` and `onKeyDown` (Enter key) both call `onRename(record.id, inputValue)` then set `editingId = null`

---

## Error Handling

| Case | Handling |
|---|---|
| `POST /api/topic` fails (network/Gemini error) | Inline error below Generate button: "Couldn't generate topic. Try again." Auto-clears on next attempt. |
| Gemini returns invalid JSON for topic | Backend falls back to `PROMPT_BANK[mode][0]`, returns 200 with fallback data |
| Old `PracticeRecord` without `topicName` | `loadHistory` fills in derived fallback; user can rename as normal |
| User clears session name field | Empty string is stored; history shows blank (acceptable edge case) |

---

## Testing

### `topicRoute.test.ts` (Supertest)
- POST with valid mode returns `{ prompt, topicName }` both non-empty strings
- POST with invalid mode returns 400
- Gemini failure triggers fallback response (mock `geminiClient.generateTopic`)

### `TopicPicker.test.tsx`
- Renders one chip per mode entry with correct labels
- Clicking a chip calls `onTopicChange` with that entry's prompt and topicName
- Generate button shows loading state while fetching
- Generate success calls `onTopicChange` with returned values
- Generate failure shows inline error message
- Editing session name field calls `onTopicChange` with updated name and unchanged prompt

### `HistoryList.test.tsx` updates
- Add `onRename` prop to existing renders (no-op stub)
- Clicking a record name renders an input with current value
- Blurring the input calls `onRename` with the new value

---

## Acceptance Criteria

- [ ] `npm run test` green (both workspaces)
- [ ] 4 chips per mode visible in TopicPicker; clicking one updates PromptCard and session name
- [ ] "Generate new…" button fetches from `/api/topic`, updates PromptCard and session name
- [ ] Session name field is editable at any time before saving
- [ ] Saved record includes `topicName`; history list shows it
- [ ] Clicking a name in history turns it into an input; blur/Enter persists the rename
- [ ] Old localStorage records without `topicName` load without error (fallback applied)
- [ ] API failure on Generate shows non-blocking error, does not reset draft or feedback
