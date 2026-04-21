# Feedback Diff View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show word-level diffs of each rewrite against the original sentence in the FeedbackPanel, with surrounding draft context and tab toggle between multiple rewrites.

**Architecture:** A new `wordDiff` utility wraps the `diff` package. A new `RewriteDiff` component handles tab state, context extraction, and diff rendering. `FeedbackPanel` receives a `draft` prop and renders `RewriteDiff` in each unit's revision section.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v4, Vitest, `@testing-library/react`, `@testing-library/user-event`, `diff` npm package.

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Install | `apps/web` deps | Add `diff` + `@types/diff` |
| Create | `apps/web/src/lib/wordDiff.ts` | Wraps `diffWords()`, returns typed token array |
| Create | `apps/web/src/__tests__/wordDiff.test.ts` | Unit tests for wordDiff utility |
| Create | `apps/web/src/components/RewriteDiff.tsx` | Tab strip + context extraction + diff render |
| Create | `apps/web/src/__tests__/RewriteDiff.test.tsx` | Component tests for RewriteDiff |
| Modify | `apps/web/src/components/FeedbackPanel.tsx` | Add `draft` prop, render `RewriteDiff` |
| Modify | `apps/web/src/__tests__/FeedbackPanel.test.tsx` | Add `draft` prop to all renders, update rewrite test |
| Modify | `apps/web/src/App.tsx` | Pass `draft={draft}` to `<FeedbackPanel>` |

---

## Task 1 — Install `diff` package

**Files:**
- Modify: `apps/web/package.json` (via npm install)

- [ ] **Step 1: Install the packages**

```bash
npm install --workspace apps/web diff
npm install --workspace apps/web --save-dev @types/diff
```

Expected: `apps/web/package.json` now lists `diff` in `dependencies` and `@types/diff` in `devDependencies`.

- [ ] **Step 2: Verify TypeScript resolves the types**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors (or only pre-existing errors unrelated to `diff`).

- [ ] **Step 3: Commit**

```bash
git add apps/web/package.json package-lock.json
git commit -m "chore: add diff package to apps/web"
```

---

## Task 2 — `wordDiff` utility (TDD)

**Files:**
- Create: `apps/web/src/lib/wordDiff.ts`
- Create: `apps/web/src/__tests__/wordDiff.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `apps/web/src/__tests__/wordDiff.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { wordDiff } from '../lib/wordDiff'

describe('wordDiff', () => {
  it('returns all unchanged tokens for identical strings', () => {
    const tokens = wordDiff('hello world', 'hello world')
    expect(tokens.every((t) => t.type === 'unchanged')).toBe(true)
    expect(tokens.map((t) => t.text).join('')).toBe('hello world')
  })

  it('marks swapped word as removed + added', () => {
    const tokens = wordDiff('governments should invest', 'authorities should invest')
    const removed = tokens.filter((t) => t.type === 'removed')
    const added = tokens.filter((t) => t.type === 'added')
    expect(removed.map((t) => t.text).join('')).toContain('governments')
    expect(added.map((t) => t.text).join('')).toContain('authorities')
  })

  it('marks inserted word as added', () => {
    const tokens = wordDiff('take action', 'take decisive action')
    const added = tokens.filter((t) => t.type === 'added')
    expect(added.map((t) => t.text).join('')).toContain('decisive')
  })

  it('marks deleted word as removed', () => {
    const tokens = wordDiff('take decisive action', 'take action')
    const removed = tokens.filter((t) => t.type === 'removed')
    expect(removed.map((t) => t.text).join('')).toContain('decisive')
  })

  it('reconstructing all token texts reproduces the revised string', () => {
    const original = 'The government should taking action.'
    const revised = 'The government should take action.'
    const tokens = wordDiff(original, revised)
    const reconstructed = tokens
      .filter((t) => t.type !== 'removed')
      .map((t) => t.text)
      .join('')
    expect(reconstructed).toBe(revised)
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm --workspace apps/web run test -- --reporter=verbose 2>&1 | grep -A5 'wordDiff'
```

Expected: `wordDiff` tests fail with "Cannot find module '../lib/wordDiff'".

- [ ] **Step 3: Implement `wordDiff.ts`**

Create `apps/web/src/lib/wordDiff.ts`:

```ts
import { diffWords } from 'diff'

export type DiffToken = { text: string; type: 'added' | 'removed' | 'unchanged' }

export function wordDiff(original: string, revised: string): DiffToken[] {
  return diffWords(original, revised).map((part) => ({
    text: part.value,
    type: part.added ? 'added' : part.removed ? 'removed' : 'unchanged',
  }))
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm --workspace apps/web run test -- --reporter=verbose 2>&1 | grep -A10 'wordDiff'
```

Expected: all 5 `wordDiff` tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/wordDiff.ts apps/web/src/__tests__/wordDiff.test.ts
git commit -m "feat: add wordDiff utility wrapping diff package"
```

---

## Task 3 — `RewriteDiff` component (TDD)

**Files:**
- Create: `apps/web/src/components/RewriteDiff.tsx`
- Create: `apps/web/src/__tests__/RewriteDiff.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `apps/web/src/__tests__/RewriteDiff.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RewriteDiff } from '../components/RewriteDiff'

const baseProps = {
  targetText: 'The government should taking action.',
  rewrites: [
    'The government should take action.',
    'The government must take decisive action.',
  ],
  draft: 'Background sentence. The government should taking action. Next sentence.',
}

describe('RewriteDiff', () => {
  it('returns null when rewrites is empty', () => {
    const { container } = render(
      <RewriteDiff targetText="foo" rewrites={[]} draft="" />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders one tab button per rewrite', () => {
    render(<RewriteDiff {...baseProps} />)
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument()
  })

  it('first tab is active (aria-pressed=true) by default', () => {
    render(<RewriteDiff {...baseProps} />)
    expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('clicking tab 2 sets it as active', async () => {
    const user = userEvent.setup()
    render(<RewriteDiff {...baseProps} />)
    await user.click(screen.getByRole('button', { name: '2' }))
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('shows removed token (del) for the changed word in rewrite 1', () => {
    render(<RewriteDiff {...baseProps} />)
    const delEl = document.querySelector('del')
    expect(delEl?.textContent).toContain('taking')
  })

  it('shows added token (ins) for the changed word in rewrite 1', () => {
    render(<RewriteDiff {...baseProps} />)
    const insEl = document.querySelector('ins')
    expect(insEl?.textContent).toContain('take')
  })

  it('shows surrounding draft context when targetText is found', () => {
    render(<RewriteDiff {...baseProps} />)
    expect(screen.getByText(/Background sentence\./)).toBeInTheDocument()
  })

  it('does not crash when targetText is not in draft', () => {
    expect(() =>
      render(
        <RewriteDiff
          {...baseProps}
          draft="Completely unrelated text with no match."
        />
      )
    ).not.toThrow()
    // Diff still renders without context
    const delEl = document.querySelector('del')
    expect(delEl?.textContent).toContain('taking')
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm --workspace apps/web run test -- --reporter=verbose 2>&1 | grep -A5 'RewriteDiff'
```

Expected: fails with "Cannot find module '../components/RewriteDiff'".

- [ ] **Step 3: Implement `RewriteDiff.tsx`**

Create `apps/web/src/components/RewriteDiff.tsx`:

```tsx
import { useState } from 'react'
import { wordDiff } from '../lib/wordDiff'

interface RewriteDiffProps {
  targetText: string
  rewrites: string[]
  draft: string
}

function extractContext(draft: string, targetText: string): { before: string; after: string } {
  const pos = draft.indexOf(targetText)
  if (pos === -1) return { before: '', after: '' }

  const beforeChunk = draft.slice(0, pos)
  const lastDot = beforeChunk.lastIndexOf('. ')
  const before = lastDot === -1 ? beforeChunk.trim() : beforeChunk.slice(lastDot + 2).trim()

  const afterChunk = draft.slice(pos + targetText.length)
  const nextDot = afterChunk.indexOf('. ')
  const after = nextDot === -1 ? afterChunk.trim() : afterChunk.slice(0, nextDot + 1).trim()

  return { before, after }
}

export function RewriteDiff({ targetText, rewrites, draft }: RewriteDiffProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (rewrites.length === 0) return null

  const { before, after } = extractContext(draft, targetText)
  const tokens = wordDiff(targetText, rewrites[activeIndex])

  return (
    <div>
      <div className="flex gap-1 mb-2">
        {rewrites.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            aria-pressed={activeIndex === i}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
              activeIndex === i
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <p className="text-sm leading-relaxed">
        {before && <span className="text-slate-400">{before} </span>}
        {tokens.map((token, i) => {
          if (token.type === 'removed') {
            return (
              <del key={i} className="bg-red-100 text-red-700 line-through">
                {token.text}
              </del>
            )
          }
          if (token.type === 'added') {
            return (
              <ins key={i} className="bg-green-100 text-green-700 no-underline">
                {token.text}
              </ins>
            )
          }
          return <span key={i}>{token.text}</span>
        })}
        {after && <span className="text-slate-400"> {after}</span>}
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm --workspace apps/web run test -- --reporter=verbose 2>&1 | grep -A15 'RewriteDiff'
```

Expected: all 8 `RewriteDiff` tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/RewriteDiff.tsx apps/web/src/__tests__/RewriteDiff.test.tsx
git commit -m "feat: add RewriteDiff component with tab toggle and word-level diff"
```

---

## Task 4 — Update `FeedbackPanel` and its tests

**Files:**
- Modify: `apps/web/src/components/FeedbackPanel.tsx`
- Modify: `apps/web/src/__tests__/FeedbackPanel.test.tsx`

- [ ] **Step 1: Update the test file first**

Replace the full contents of `apps/web/src/__tests__/FeedbackPanel.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FeedbackPanel } from '../components/FeedbackPanel'
import type { FeedbackUnit } from '../types'

const unit: FeedbackUnit = {
  level: 'sentence',
  targetText: 'The government should taking action.',
  strengths: ['Clear argument'],
  issues: ['Grammar error'],
  revision: {
    explanation: 'Modal verbs take bare infinitive, not gerund.',
    rewrites: [
      'The government should take action.',
      'The government must take decisive action.',
    ],
  },
}

describe('FeedbackPanel', () => {
  it('renders nothing when feedback is empty', () => {
    const { container } = render(<FeedbackPanel feedback={[]} draft="" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the target text', () => {
    render(<FeedbackPanel feedback={[unit]} draft="" />)
    expect(screen.getByText('The government should taking action.')).toBeInTheDocument()
  })

  it('renders strengths', () => {
    render(<FeedbackPanel feedback={[unit]} draft="" />)
    expect(screen.getByText('Clear argument')).toBeInTheDocument()
  })

  it('renders issues', () => {
    render(<FeedbackPanel feedback={[unit]} draft="" />)
    expect(screen.getByText('Grammar error')).toBeInTheDocument()
  })

  it('renders revision explanation', () => {
    render(<FeedbackPanel feedback={[unit]} draft="" />)
    expect(screen.getByText(/Modal verbs take bare infinitive/)).toBeInTheDocument()
  })

  it('renders rewrite tab buttons', () => {
    render(<FeedbackPanel feedback={[unit]} draft="" />)
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument()
  })

  it('renders multiple feedback units', () => {
    const unit2: FeedbackUnit = {
      ...unit,
      targetText: 'Second sentence here.',
      revision: { explanation: 'Another issue.', rewrites: ['Better second sentence.'] },
    }
    render(<FeedbackPanel feedback={[unit, unit2]} draft="" />)
    expect(screen.getByText('The government should taking action.')).toBeInTheDocument()
    expect(screen.getByText('Second sentence here.')).toBeInTheDocument()
  })

  it('shows diff tokens when targetText is present in draft', () => {
    const draft = 'The government should taking action. It matters.'
    render(<FeedbackPanel feedback={[unit]} draft={draft} />)
    const delEl = document.querySelector('del')
    expect(delEl?.textContent).toContain('taking')
  })
})
```

- [ ] **Step 2: Run to confirm the old tests now fail (draft prop missing)**

```bash
npm --workspace apps/web run test -- --reporter=verbose 2>&1 | grep -E '(FAIL|PASS|✓|✗|×)' | head -20
```

Expected: `FeedbackPanel` tests fail because `FeedbackPanel` doesn't accept `draft` yet.

- [ ] **Step 3: Update `FeedbackPanel.tsx`**

Replace the full contents of `apps/web/src/components/FeedbackPanel.tsx`:

```tsx
import type { FeedbackUnit } from '../types'
import { RewriteDiff } from './RewriteDiff'

interface FeedbackPanelProps {
  feedback: FeedbackUnit[]
  draft: string
}

export function FeedbackPanel({ feedback, draft }: FeedbackPanelProps) {
  if (feedback.length === 0) return null

  return (
    <div>
      <h2 className="text-base font-semibold text-slate-900 mb-3">Feedback</h2>
      {feedback.map((unit, i) => (
        <div key={i} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm mb-3 last:mb-0">
          <p className="italic text-slate-600 border-l-2 border-slate-300 pl-3 mb-3 text-sm">
            {unit.targetText}
          </p>

          {unit.strengths.length > 0 && (
            <>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Strengths</p>
              <ul className="list-disc pl-4 text-sm text-emerald-800 space-y-0.5 mb-3">
                {unit.strengths.map((s, j) => <li key={j}>{s}</li>)}
              </ul>
            </>
          )}

          {unit.issues.length > 0 && (
            <>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Issues</p>
              <ul className="list-disc pl-4 text-sm text-amber-800 space-y-0.5 mb-3">
                {unit.issues.map((issue, j) => <li key={j}>{issue}</li>)}
              </ul>
            </>
          )}

          <div className="bg-slate-50 rounded-md p-3 border border-slate-200">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">Revision</p>
            <p className="text-sm text-slate-700 mb-2">{unit.revision.explanation}</p>
            {unit.revision.rewrites.length > 0 && (
              <>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                  Alternative Rewrites
                </p>
                <RewriteDiff
                  targetText={unit.targetText}
                  rewrites={unit.revision.rewrites}
                  draft={draft}
                />
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run all tests to confirm they pass**

```bash
npm --workspace apps/web run test -- --reporter=verbose 2>&1 | tail -20
```

Expected: all tests pass, including the updated `FeedbackPanel` suite.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/FeedbackPanel.tsx apps/web/src/__tests__/FeedbackPanel.test.tsx
git commit -m "feat: update FeedbackPanel to use RewriteDiff with draft context"
```

---

## Task 5 — Wire `draft` prop in `App.tsx`

**Files:**
- Modify: `apps/web/src/App.tsx` (line 102)

- [ ] **Step 1: Pass `draft` to `FeedbackPanel`**

In `apps/web/src/App.tsx`, find the `<FeedbackPanel>` render (currently line 102) and add the `draft` prop:

Old:
```tsx
<FeedbackPanel feedback={feedback} />
```

New:
```tsx
<FeedbackPanel feedback={feedback} draft={draft} />
```

- [ ] **Step 2: Run full test suite**

```bash
npm --workspace apps/web run test
```

Expected: all 18+ tests pass (3 test files).

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/App.tsx
git commit -m "feat: pass draft to FeedbackPanel for diff context"
```

---

## Task 6 — Verify

- [ ] **Step 1: Run full test suite one last time**

```bash
npm --workspace apps/web run test
```

Expected: all tests pass, no failures.

- [ ] **Step 2: Manual smoke test**

Start the dev server:
```bash
npm run dev
```

1. Open http://localhost:5173
2. Select any mode, paste a sentence into the editor (e.g., "The government should taking action.")
3. Click "Check Sentence"
4. In the Feedback panel, find the Revision section — verify:
   - Tab buttons (1, 2, 3…) appear
   - Active tab shows the diff with red strikethrough for removed words and green highlight for added words
   - Surrounding draft context appears in muted text if the sentence is found in the draft
   - Clicking another tab updates the diff

- [ ] **Step 3: Final commit if any fixes were made**

If no fixes needed, no extra commit required. Otherwise:
```bash
git add -p
git commit -m "fix: <describe what was fixed>"
```
