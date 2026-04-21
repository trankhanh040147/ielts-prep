# Feedback Diff View — Design Spec

**Date:** 2026-04-21
**Feature:** v0.2 — Feedback diff view
**Scope:** `apps/web` only. No backend changes.

---

## Overview

After receiving feedback, each FeedbackUnit in the right-column panel shows its revision rewrites as a word-level diff against the original sentence, displayed with one sentence of surrounding draft context. Users tab between multiple rewrites (up to 3) to see each diff one at a time.

---

## File Change List

| Action | File |
|---|---|
| Install dep | `apps/web` — add `diff` + `@types/diff` |
| Create | `apps/web/src/lib/wordDiff.ts` |
| Create | `apps/web/src/components/RewriteDiff.tsx` |
| Modify | `apps/web/src/components/FeedbackPanel.tsx` |
| Modify | `apps/web/src/App.tsx` |
| Create | `apps/web/src/__tests__/wordDiff.test.ts` |
| Create | `apps/web/src/__tests__/RewriteDiff.test.tsx` |
| Modify | `apps/web/src/__tests__/FeedbackPanel.test.tsx` |

---

## Architecture

### wordDiff utility (`src/lib/wordDiff.ts`)

```ts
type DiffToken = { text: string; type: 'added' | 'removed' | 'unchanged' }
function wordDiff(original: string, revised: string): DiffToken[]
```

Thin wrapper around `diffWords()` from the `diff` package. Maps each change chunk to a `DiffToken`. Exported for unit testing.

### RewriteDiff component (`src/components/RewriteDiff.tsx`)

Props:
```ts
interface RewriteDiffProps {
  targetText: string
  rewrites: string[]
  draft: string
}
```

Behaviour:
- Local `useState<number>(0)` for active tab index
- Renders a tab strip: numbered buttons "1" / "2" / "3" (only as many as `rewrites.length`)
- Active tab is highlighted (indigo); inactive tabs are muted slate
- Finds `targetText` in `draft` via `draft.indexOf(targetText)`:
  - **Found:** extracts up to 1 sentence before and after the match by scanning for `. ` boundaries (or string start/end). Renders: `[prevSentence…] [diff] […nextSentence]` — context sentences in muted `text-slate-400`, diff inline.
  - **Not found (Gemini paraphrased):** renders diff alone, no context snippet.
- Calls `wordDiff(targetText, rewrites[activeIndex])` for the active tab
- Renders tokens: `removed` → `<del>` with `bg-red-100 text-red-700 line-through`; `added` → `<ins>` with `bg-green-100 text-green-700 no-underline`; `unchanged` → plain `<span>`

### FeedbackPanel changes (`src/components/FeedbackPanel.tsx`)

- Add `draft: string` to `FeedbackPanelProps`
- Replace the current flat `<ul>` rewrite list with `<RewriteDiff targetText={unit.targetText} rewrites={unit.revision.rewrites} draft={draft} />`
- Keep the `revision.explanation` paragraph above `RewriteDiff` unchanged

### App.tsx changes

- Pass `draft={draft}` to `<FeedbackPanel>`

---

## Context Extraction Algorithm

```
1. pos = draft.indexOf(targetText)
2. if pos === -1: return { before: '', target: targetText, after: '' }
3. Walk backwards from pos to find last '. ' before pos → prevStart
4. Walk forwards from pos + targetText.length to find next '. ' → afterEnd
5. before = draft.slice(prevStart, pos).trim()
6. after  = draft.slice(pos + targetText.length, afterEnd).trim()
```

Sentence boundary = `. ` (period + space) or string edge. Extract at most one sentence in each direction.

---

## Error / Edge Cases

| Case | Handling |
|---|---|
| `targetText` not found in draft | Show diff without context. No error thrown. |
| Only 1 rewrite | Tab strip shows single tab "1" (no toggle needed, still renders consistently) |
| Empty rewrites array | `RewriteDiff` returns `null` |
| Identical rewrite to targetText | All tokens render as `unchanged` — no red/green |

---

## Testing

### `wordDiff.test.ts`
- Basic replacement: one word swapped → one `removed` + one `added` token
- Insertion: extra word added mid-sentence → `added` token in correct position
- Deletion: word removed → `removed` token
- Identical strings → all `unchanged`
- Punctuation adjacent to words handled correctly

### `RewriteDiff.test.tsx`
- Renders tab strip with correct count
- Clicking tab 2 shows second rewrite diff
- Removed/added tokens have correct aria or text content
- Falls back gracefully when `targetText` not in draft (no crash, diff still shown)

### `FeedbackPanel.test.tsx`
- Add `draft` prop to all existing render calls (empty string is fine for existing tests)
- Add one test: with real `targetText` present in `draft`, the diff renders the correct rewrite

---

## Acceptance Criteria

- [ ] `npm --workspace apps/web run test` green
- [ ] Each FeedbackUnit revision section shows numbered tabs for rewrites
- [ ] Active tab shows word-level diff: red strikethrough for removed words, green highlight for added
- [ ] Surrounding draft context (muted) appears when `targetText` is found in draft
- [ ] Switching tabs updates the displayed diff
- [ ] When `targetText` not in draft, diff renders without crash
- [ ] No visual regression on existing FeedbackPanel layout
