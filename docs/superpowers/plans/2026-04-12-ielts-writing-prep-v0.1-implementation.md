# IELTS Writing Prep v0.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web-only IELTS Writing Task 2 demo with one complete loop: mode -> write -> realtime feedback -> revise -> save -> reload history.

**Architecture:** Use a monorepo with two apps: `apps/api` (Express feedback API) and `apps/web` (React + Vite UI). The API owns Gemini access and response normalization. The web app owns the writing workflow, local persistence, and history rendering.

**Tech Stack:** TypeScript, React, Vite, Express, Zod, Vitest, Testing Library, Supertest, `@google/generative-ai`.

---

## File Structure

- Create: `package.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/vitest.config.ts`
- Create: `apps/api/src/app.ts`
- Create: `apps/api/src/index.ts`
- Create: `apps/api/src/types.ts`
- Create: `apps/api/src/services/geminiClient.ts`
- Create: `apps/api/src/services/feedbackMapper.ts`
- Create: `apps/api/src/routes/healthRoute.ts`
- Create: `apps/api/src/routes/feedbackRoute.ts`
- Create: `apps/api/src/__tests__/healthRoute.test.ts`
- Create: `apps/api/src/__tests__/feedbackMapper.test.ts`
- Create: `apps/api/src/__tests__/feedbackRoute.test.ts`
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/index.html`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx`
- Create: `apps/web/src/types.ts`
- Create: `apps/web/src/lib/api.ts`
- Create: `apps/web/src/lib/promptBank.ts`
- Create: `apps/web/src/lib/storage.ts`
- Create: `apps/web/src/components/ModePicker.tsx`
- Create: `apps/web/src/components/PromptCard.tsx`
- Create: `apps/web/src/components/DraftEditor.tsx`
- Create: `apps/web/src/components/FeedbackPanel.tsx`
- Create: `apps/web/src/components/SavePracticeButton.tsx`
- Create: `apps/web/src/components/HistoryList.tsx`
- Create: `apps/web/src/__tests__/practiceFlow.test.tsx`
- Create: `apps/web/src/__tests__/storage.test.ts`
- Create: `apps/web/src/setupTests.ts`
- Modify: `README.md`
- Modify: `docs/ielts-prep-v0.1-output-2026-04-08.md`

---

### Task 1: Bootstrap workspace and API health endpoint

**Files:**
- Create: `package.json`, `.gitignore`, `.env.example`
- Create: `apps/api/package.json`, `apps/api/tsconfig.json`, `apps/api/vitest.config.ts`
- Create: `apps/api/src/app.ts`, `apps/api/src/index.ts`, `apps/api/src/routes/healthRoute.ts`
- Test: `apps/api/src/__tests__/healthRoute.test.ts`

- [ ] **Step 1: Write failing health route test**

```ts
import request from 'supertest'
import { describe, it, expect } from 'vitest'
import { app } from '../app'

describe('GET /health', () => {
  it('returns status ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })
})
```

- [ ] **Step 2: Run test and confirm failure**

Run: `npm --workspace apps/api run test -- healthRoute.test.ts`
Expected: FAIL because `app` is not implemented yet.

- [ ] **Step 3: Implement minimal app and health route**

```ts
// app.ts
import express from 'express'
import { healthRoute } from './routes/healthRoute'

export const app = express()
app.use(express.json())
app.use(healthRoute)

// healthRoute.ts
import { Router } from 'express'
export const healthRoute = Router()
healthRoute.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})
```

- [ ] **Step 4: Re-run test and verify pass**

Run: `npm --workspace apps/api run test -- healthRoute.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit checkpoint (optional if user requests commits)**

```bash
git add package.json .gitignore .env.example apps/api
git commit -m "chore: bootstrap workspace and api health route"
```

---

### Task 2: Implement feedback schema and mapper with fallback

**Files:**
- Create: `apps/api/src/types.ts`
- Create: `apps/api/src/services/feedbackMapper.ts`
- Test: `apps/api/src/__tests__/feedbackMapper.test.ts`

- [ ] **Step 1: Write failing mapper tests**

```ts
import { describe, it, expect } from 'vitest'
import { mapGeminiToFeedback } from '../services/feedbackMapper'

describe('mapGeminiToFeedback', () => {
  it('maps valid raw payload', () => {
    const raw = {
      feedback: [{ strengths: ['clear'], issues: ['grammar'], revisionHint: 'improve verb tense' }],
    }

    const out = mapGeminiToFeedback(raw, 'sentence', 'Sample text')
    expect(out[0].level).toBe('sentence')
    expect(out[0].targetText).toBe('Sample text')
  })

  it('returns fallback when payload is invalid', () => {
    const out = mapGeminiToFeedback({}, 'paragraph', 'Paragraph text')
    expect(out).toHaveLength(1)
    expect(out[0].revisionHint.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test and confirm failure**

Run: `npm --workspace apps/api run test -- feedbackMapper.test.ts`
Expected: FAIL because mapper does not exist yet.

- [ ] **Step 3: Implement shared types and mapper**

```ts
export type PracticeMode = 'thesis' | 'paragraph' | 'miniEssay'
export type FeedbackLevel = 'sentence' | 'paragraph'

export type FeedbackUnit = {
  level: FeedbackLevel
  targetText: string
  strengths: string[]
  issues: string[]
  revisionHint: string
}
```

```ts
import type { FeedbackLevel, FeedbackUnit } from '../types'

export function mapGeminiToFeedback(raw: unknown, level: FeedbackLevel, targetText: string): FeedbackUnit[] {
  const items = (raw as { feedback?: unknown[] } | null)?.feedback

  if (!Array.isArray(items) || items.length === 0) {
    return [
      {
        level,
        targetText,
        strengths: ['You addressed the prompt directly.'],
        issues: ['Could not parse provider response.'],
        revisionHint: 'Revise one sentence for grammar and clarity.',
      },
    ]
  }

  return items.map((item) => {
    const x = item as {
      strengths?: unknown
      issues?: unknown
      revisionHint?: unknown
    }
    return {
      level,
      targetText,
      strengths: Array.isArray(x.strengths) ? x.strengths.filter((v): v is string => typeof v === 'string') : [],
      issues: Array.isArray(x.issues) ? x.issues.filter((v): v is string => typeof v === 'string') : [],
      revisionHint: typeof x.revisionHint === 'string' ? x.revisionHint : 'Revise for clearer logic and grammar.',
    }
  })
}
```

- [ ] **Step 4: Re-run test and verify pass**

Run: `npm --workspace apps/api run test -- feedbackMapper.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit checkpoint (optional if user requests commits)**

```bash
git add apps/api/src/types.ts apps/api/src/services/feedbackMapper.ts apps/api/src/__tests__/feedbackMapper.test.ts
git commit -m "feat(api): add feedback mapper with fallback normalization"
```

---

### Task 3: Build `/api/feedback` with validation and Gemini integration

**Files:**
- Create: `apps/api/src/services/geminiClient.ts`
- Create: `apps/api/src/routes/feedbackRoute.ts`
- Modify: `apps/api/src/app.ts`
- Test: `apps/api/src/__tests__/feedbackRoute.test.ts`

- [ ] **Step 1: Write failing success-path route test**

```ts
import request from 'supertest'
import { describe, it, expect, vi } from 'vitest'
import { app } from '../app'

vi.mock('../services/geminiClient', () => ({
  getGeminiFeedback: vi.fn(async () => ({
    feedback: [{ strengths: ['clear thesis'], issues: ['minor grammar'], revisionHint: 'tighten verbs' }],
  })),
}))

describe('POST /api/feedback', () => {
  it('returns normalized feedback', async () => {
    const res = await request(app).post('/api/feedback').send({
      mode: 'thesis',
      level: 'sentence',
      text: 'Governments should invest in rail.',
      prompt: 'Some people think...',
    })

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.feedback)).toBe(true)
    expect(res.body.feedback[0].level).toBe('sentence')
  })
})
```

- [ ] **Step 2: Run test and confirm failure**

Run: `npm --workspace apps/api run test -- feedbackRoute.test.ts`
Expected: FAIL because route is missing.

- [ ] **Step 3: Implement route with Zod validation and mapping**

```ts
import { Router } from 'express'
import { z } from 'zod'
import { getGeminiFeedback } from '../services/geminiClient'
import { mapGeminiToFeedback } from '../services/feedbackMapper'

const feedbackRequestSchema = z.object({
  mode: z.enum(['thesis', 'paragraph', 'miniEssay']),
  level: z.enum(['sentence', 'paragraph']),
  text: z.string().min(1),
  prompt: z.string().min(1),
})

export const feedbackRoute = Router()
feedbackRoute.post('/api/feedback', async (req, res) => {
  const parsed = feedbackRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid feedback request' })
  }

  try {
    const raw = await getGeminiFeedback(parsed.data)
    const feedback = mapGeminiToFeedback(raw, parsed.data.level, parsed.data.text)
    return res.json({ feedback })
  } catch {
    return res.status(502).json({ error: 'Feedback service unavailable' })
  }
})
```

- [ ] **Step 4: Implement Gemini client module**

```ts
import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY
const modelName = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash'

if (!apiKey) {
  throw new Error('Missing GEMINI_API_KEY')
}

const client = new GoogleGenerativeAI(apiKey)

type GeminiInput = {
  mode: 'thesis' | 'paragraph' | 'miniEssay'
  level: 'sentence' | 'paragraph'
  text: string
  prompt: string
}

export async function getGeminiFeedback(input: GeminiInput): Promise<unknown> {
  const model = client.getGenerativeModel({ model: modelName })
  const instruction = [
    'Return strict JSON only.',
    'Schema: {"feedback":[{"strengths":[string],"issues":[string],"revisionHint":string}]}.',
    `Mode: ${input.mode}.`,
    `Level: ${input.level}.`,
    `Prompt: ${input.prompt}.`,
    `Text: ${input.text}.`,
  ].join(' ')

  const result = await model.generateContent(instruction)
  const text = result.response.text()
  return JSON.parse(text)
}
```

- [ ] **Step 5: Wire route in app and run API tests**

Run: `npm --workspace apps/api run test`
Expected: PASS for health, mapper, and feedback route tests.

- [ ] **Step 6: Commit checkpoint (optional if user requests commits)**

```bash
git add apps/api/src
git commit -m "feat(api): add validated gemini feedback endpoint"
```

---

### Task 4: Implement web vertical slice (`thesis` mode first)

**Files:**
- Create: `apps/web/package.json`, `apps/web/tsconfig.json`, `apps/web/vite.config.ts`, `apps/web/index.html`
- Create: `apps/web/src/main.tsx`, `apps/web/src/App.tsx`, `apps/web/src/types.ts`
- Create: `apps/web/src/lib/api.ts`, `apps/web/src/lib/promptBank.ts`
- Create: `apps/web/src/components/*.tsx`
- Test: `apps/web/src/__tests__/practiceFlow.test.tsx`

- [ ] **Step 1: Write failing flow test (select mode -> write -> check sentence -> see feedback)**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, it, expect } from 'vitest'
import App from '../App'

it('runs thesis mode sentence feedback flow', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      new Response(
        JSON.stringify({
          feedback: [
            {
              level: 'sentence',
              targetText: 'Governments should invest in rail.',
              strengths: ['clear thesis'],
              issues: ['minor grammar'],
              revisionHint: 'tighten verb choices',
            },
          ],
        }),
        { status: 200 },
      ),
    ) as unknown as typeof fetch,
  )

  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: /thesis drill/i }))
  await user.type(screen.getByLabelText(/writing draft/i), 'Governments should invest in rail.')
  await user.click(screen.getByRole('button', { name: /check sentence/i }))

  expect(await screen.findByText(/clear thesis/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test and confirm failure**

Run: `npm --workspace apps/web run test -- practiceFlow.test.tsx`
Expected: FAIL because app/components are not implemented.

- [ ] **Step 3: Implement minimal UI and API caller**

```ts
// api.ts
export async function requestFeedback(body: {
  mode: 'thesis' | 'paragraph' | 'miniEssay'
  level: 'sentence' | 'paragraph'
  text: string
  prompt: string
}) {
  const res = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}
```

```tsx
// App.tsx core state
const [mode, setMode] = useState<PracticeMode>('thesis')
const [draft, setDraft] = useState('')
const [feedback, setFeedback] = useState<FeedbackUnit[]>([])
```

- [ ] **Step 4: Re-run test and verify pass**

Run: `npm --workspace apps/web run test -- practiceFlow.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit checkpoint (optional if user requests commits)**

```bash
git add apps/web
git commit -m "feat(web): add thesis vertical slice feedback loop"
```

---

### Task 5: Add local save, validation, and history reload

**Files:**
- Create: `apps/web/src/lib/storage.ts`
- Modify: `apps/web/src/App.tsx`, `apps/web/src/components/SavePracticeButton.tsx`, `apps/web/src/components/HistoryList.tsx`
- Test: `apps/web/src/__tests__/storage.test.ts`
- Test: `apps/web/src/__tests__/practiceFlow.test.tsx`

- [ ] **Step 1: Write failing storage tests**

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { loadHistory, savePractice } from '../lib/storage'

beforeEach(() => localStorage.clear())

describe('storage', () => {
  it('rejects empty draft', () => {
    expect(() =>
      savePractice({
        id: '1',
        mode: 'thesis',
        prompt: 'p',
        draft: '   ',
        feedback: [],
        updatedAt: '2026-04-12T11:00:00.000Z',
      }),
    ).toThrow(/writing text is required/i)
  })

  it('keeps newest first', () => {
    savePractice({ id: '1', mode: 'thesis', prompt: 'p', draft: 'old', feedback: [], updatedAt: '2026-04-12T10:00:00.000Z' })
    savePractice({ id: '2', mode: 'thesis', prompt: 'p', draft: 'new', feedback: [], updatedAt: '2026-04-12T11:00:00.000Z' })
    const history = loadHistory()
    expect(history[0].id).toBe('2')
  })
})
```

- [ ] **Step 2: Run test and confirm failure**

Run: `npm --workspace apps/web run test -- storage.test.ts`
Expected: FAIL because storage helpers are missing.

- [ ] **Step 3: Implement storage helpers and save guard**

```ts
const STORAGE_KEY = 'ieltsPrep.v0.1.history'

export function loadHistory(): PracticeRecord[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  const parsed = JSON.parse(raw) as PracticeRecord[]
  return parsed.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
}

export function savePractice(record: PracticeRecord): PracticeRecord[] {
  if (!record.draft.trim()) {
    throw new Error('Writing text is required')
  }
  const next = [record, ...loadHistory().filter((x) => x.id !== record.id)].sort((a, b) =>
    a.updatedAt < b.updatedAt ? 1 : -1,
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}
```

- [ ] **Step 4: Extend UI tests for save error and history reload**

Run: `npm --workspace apps/web run test -- practiceFlow.test.tsx`
Expected: initially FAIL until UI wiring is completed.

- [ ] **Step 5: Implement Save button behavior and history panel**

Expected behaviors:
- Save disabled or rejected on empty draft.
- Inline error text is visible.
- Saving valid draft immediately refreshes history list.
- Clicking a history entry reloads draft and feedback.

- [ ] **Step 6: Run web tests and verify pass**

Run: `npm --workspace apps/web run test`
Expected: PASS for all web tests.

- [ ] **Step 7: Commit checkpoint (optional if user requests commits)**

```bash
git add apps/web/src
git commit -m "feat(web): add local persistence, save validation, and history reload"
```

---

### Task 6: Expand to three modes, paragraph checks, resilience, and demo evidence

**Files:**
- Modify: `apps/web/src/lib/promptBank.ts`
- Modify: `apps/web/src/components/ModePicker.tsx`
- Modify: `apps/web/src/components/DraftEditor.tsx`
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/__tests__/practiceFlow.test.tsx`
- Modify: `README.md`
- Modify: `docs/ielts-prep-v0.1-output-2026-04-08.md`

- [ ] **Step 1: Write failing tests for 3 modes and paragraph check button**

Test assertions to add:
- `thesis drill` button visible.
- `paragraph drill` button visible.
- `mini essay drill` button visible.
- `check paragraph` action visible and works.

- [ ] **Step 2: Run tests and confirm failure**

Run: `npm --workspace apps/web run test -- practiceFlow.test.tsx`
Expected: FAIL before full mode expansion.

- [ ] **Step 3: Implement mode expansion and prompt bank per mode**

```ts
export const PROMPT_BANK: Record<'thesis' | 'paragraph' | 'miniEssay', string[]> = {
  thesis: [
    'Some people think governments should spend money on railways rather than roads. Discuss both views and give your opinion.',
  ],
  paragraph: [
    'Many believe online education is replacing traditional classrooms. To what extent do you agree or disagree?',
  ],
  miniEssay: [
    'In many countries, young people are moving to cities. What are the causes and effects?',
  ],
}
```

- [ ] **Step 4: Add failing test for API failure banner + retry, then implement**

Expected behavior:
- API error shows `Feedback service unavailable` banner.
- Draft remains in editor.
- Retry action is possible.

- [ ] **Step 5: Run all tests from root**

Run: `npm run test`
Expected: PASS for API and Web test suites.

- [ ] **Step 6: Manual end-to-end verification and evidence logging**

Run: `npm run dev`
Expected:
- Mode -> write -> feedback -> revise -> save loop works.
- Sentence and paragraph checks both work.
- Two sample practices saved and visible after refresh.
- `docs/ielts-prep-v0.1-output-2026-04-08.md` fully filled with proof.

- [ ] **Step 7: Commit checkpoint (optional if user requests commits)**

```bash
git add apps/web README.md docs/ielts-prep-v0.1-output-2026-04-08.md
git commit -m "feat: complete three-mode writing loop and demo evidence"
```

---

## Verification Checklist

- [ ] `npm run test` passes.
- [ ] Empty draft cannot be saved.
- [ ] Feedback appears after sentence and paragraph submits.
- [ ] User can revise then save.
- [ ] History persists after refresh and is sorted newest first.
- [ ] Two sample practices are documented in output log.

## Plan Self-Review

1. **Spec coverage:** all locked-scope requirements are mapped to tasks.
2. **Placeholder scan:** no `TBD`/`TODO` placeholders remain.
3. **Type consistency:** `PracticeMode` and `FeedbackUnit` contracts are consistent across API and web tasks.
