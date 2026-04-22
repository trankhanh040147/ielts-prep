# Topic Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static single-prompt bank with a topic picker (4 pre-made chips + AI Generate button), add an editable session name, and make topic names editable inline in the history list.

**Architecture:** Backend gains a `POST /api/topic` endpoint calling Gemini for fresh prompts. Frontend gains a `TopicPicker` component above `PromptCard`; `prompt` and `topicName` become state in `App.tsx`; `HistoryList` gains inline rename; `storage.ts` gains a migration fallback and `renameRecord`.

**Tech Stack:** React 18, TypeScript, Express, Zod, Vitest, @testing-library/react, @testing-library/user-event, Tailwind CSS v4.

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Modify | `apps/web/src/types.ts` | Add `topicName` to `PracticeRecord`; add `TopicResponse` type |
| Modify | `apps/web/src/lib/promptBank.ts` | Expand to `{prompt, topicName}[]` with 4 entries per mode |
| Modify | `apps/api/src/services/geminiClient.ts` | Add `generateTopic(mode)` function |
| Create | `apps/api/src/routes/topicRoute.ts` | `POST /api/topic` handler with fallback |
| Modify | `apps/api/src/app.ts` | Register `topicRoute` |
| Create | `apps/api/src/__tests__/topicRoute.test.ts` | Supertest tests for `/api/topic` |
| Modify | `apps/web/src/lib/storage.ts` | Migration fallback in `loadHistory`; new `renameRecord` |
| Modify | `apps/web/src/__tests__/storage.test.ts` | Add `topicName` to fixtures; add `renameRecord` tests |
| Create | `apps/web/src/lib/topicApi.ts` | `generateTopic(mode)` fetch wrapper |
| Create | `apps/web/src/components/TopicPicker.tsx` | Chip strip + Generate button + session name input |
| Create | `apps/web/src/__tests__/TopicPicker.test.tsx` | Component tests |
| Modify | `apps/web/src/components/SavePracticeButton.tsx` | Add `topicName` prop |
| Modify | `apps/web/src/components/HistoryList.tsx` | Show `topicName`; inline rename on click |
| Create | `apps/web/src/__tests__/HistoryList.test.tsx` | Component tests |
| Modify | `apps/web/src/App.tsx` | `prompt`/`topicName` state; wire `TopicPicker`, `handleRenameRecord`, `handleDeleteRecord` |
| Modify | `apps/web/src/__tests__/practiceFlow.test.tsx` | Update fixtures and history assertion |

---

## Task 1 — Update `types.ts` and `promptBank.ts`

**Files:**
- Modify: `apps/web/src/types.ts`
- Modify: `apps/web/src/lib/promptBank.ts`

- [ ] **Step 1: Update `types.ts`**

Replace the full contents of `apps/web/src/types.ts`:

```ts
export type PracticeMode = 'thesis' | 'paragraph' | 'miniEssay'
export type FeedbackLevel = 'sentence' | 'paragraph'
export type FeedbackUnit = {
  level: FeedbackLevel
  targetText: string
  strengths: string[]
  issues: string[]
  revision: {
    explanation: string
    rewrites: string[]
  }
}
export type PracticeRecord = {
  id: string
  mode: PracticeMode
  prompt: string
  topicName: string
  draft: string
  feedback: FeedbackUnit[]
  updatedAt: string
}
export type TopicResponse = { prompt: string; topicName: string }
```

- [ ] **Step 2: Update `promptBank.ts`**

Replace the full contents of `apps/web/src/lib/promptBank.ts`:

```ts
import type { PracticeMode } from '../types'

export const PROMPT_BANK: Record<PracticeMode, { prompt: string; topicName: string }[]> = {
  thesis: [
    {
      prompt: 'Some people think governments should spend money on railways rather than roads. Discuss both views and give your opinion.',
      topicName: 'Railways vs Roads',
    },
    {
      prompt: 'Some people believe that unpaid community service should be a compulsory part of high school programmes. To what extent do you agree or disagree?',
      topicName: 'Compulsory Community Service',
    },
    {
      prompt: 'Some argue that the best way to reduce crime is to give longer prison sentences. Others believe there are better methods. Discuss both views and give your opinion.',
      topicName: 'Crime & Prison Sentences',
    },
    {
      prompt: 'Many people think that social media has had a largely negative effect on society. To what extent do you agree or disagree?',
      topicName: 'Social Media Impact',
    },
  ],
  paragraph: [
    {
      prompt: 'Many believe online education is replacing traditional classrooms. To what extent do you agree or disagree?',
      topicName: 'Online Education',
    },
    {
      prompt: 'Some people think that a sense of competition in children should be encouraged. Others believe it is harmful. Discuss both views and give your opinion.',
      topicName: 'Competition in Children',
    },
    {
      prompt: 'It is often argued that zoos are cruel and should be abolished. To what extent do you agree or disagree?',
      topicName: 'Zoos: Cruel or Beneficial?',
    },
    {
      prompt: 'Some people think that physical exercise should be compulsory for all school students every day. Others disagree. Discuss both views and give your opinion.',
      topicName: 'Compulsory PE in Schools',
    },
  ],
  miniEssay: [
    {
      prompt: 'In many countries, young people are moving to cities. What are the causes and effects?',
      topicName: 'Youth Migration to Cities',
    },
    {
      prompt: 'In many countries the number of animals and plants is declining. Why is this happening? How can this issue be addressed?',
      topicName: 'Declining Biodiversity',
    },
    {
      prompt: 'Many people are working longer hours than ever before. What are the reasons for this? What effect does it have on individuals and society?',
      topicName: 'Overworking Trend',
    },
    {
      prompt: 'The number of people who are overweight is increasing in many countries. What are the causes of this? What measures could be taken to address this?',
      topicName: 'Global Obesity',
    },
  ],
}
```

- [ ] **Step 3: Verify TypeScript is happy**

```bash
cd /home/khanh/src/0_github/ielts-prep/apps/web && npx tsc --noEmit 2>&1 | head -30
```

Expected: errors about `topicName` missing in test fixtures — that is fine and will be fixed in later tasks. No unexpected errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/types.ts apps/web/src/lib/promptBank.ts
git commit -m "feat: add topicName to PracticeRecord and expand prompt bank"
```

---

## Task 2 — Backend: `generateTopic` + `topicRoute`

**Files:**
- Modify: `apps/api/src/services/geminiClient.ts`
- Create: `apps/api/src/routes/topicRoute.ts`
- Modify: `apps/api/src/app.ts`
- Create: `apps/api/src/__tests__/topicRoute.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/api/src/__tests__/topicRoute.test.ts`:

```ts
import request from 'supertest'
import { describe, it, expect, vi } from 'vitest'
import { app } from '../app'

vi.mock('../services/geminiClient', () => ({
  getGeminiFeedback: vi.fn(),
  generateTopic: vi.fn(async () => ({
    prompt: 'Some people think AI will replace most jobs. Discuss both views and give your opinion.',
    topicName: 'AI & Employment',
  })),
}))

describe('POST /api/topic', () => {
  it('returns prompt and topicName for valid mode', async () => {
    const res = await request(app).post('/api/topic').send({ mode: 'thesis' })
    expect(res.status).toBe(200)
    expect(typeof res.body.prompt).toBe('string')
    expect(typeof res.body.topicName).toBe('string')
    expect(res.body.prompt.length).toBeGreaterThan(10)
    expect(res.body.topicName.length).toBeGreaterThan(0)
  })

  it('returns 400 for invalid mode', async () => {
    const res = await request(app).post('/api/topic').send({ mode: 'invalid' })
    expect(res.status).toBe(400)
  })

  it('returns 400 for missing mode', async () => {
    const res = await request(app).post('/api/topic').send({})
    expect(res.status).toBe(400)
  })

  it('returns fallback when generateTopic throws', async () => {
    const { generateTopic } = await import('../services/geminiClient')
    vi.mocked(generateTopic).mockRejectedValueOnce(new Error('Gemini error'))
    const res = await request(app).post('/api/topic').send({ mode: 'paragraph' })
    expect(res.status).toBe(200)
    expect(typeof res.body.prompt).toBe('string')
    expect(typeof res.body.topicName).toBe('string')
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm --workspace apps/api run test 2>&1 | tail -15
```

Expected: test file fails — `/api/topic` returns 404 (route not registered yet).

- [ ] **Step 3: Add `generateTopic` to `geminiClient.ts`**

Open `apps/api/src/services/geminiClient.ts` and add this function at the end of the file (after the existing `getGeminiFeedback` export):

```ts
export async function generateTopic(mode: PracticeMode): Promise<{ prompt: string; topicName: string }> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY')

  const client = new GoogleGenerativeAI(apiKey)
  const model = client.getGenerativeModel({ model: modelName })

  const instruction = [
    'You are an IELTS writing coach.',
    `Generate one IELTS Academic Writing Task 2 question suitable for the practice mode: "${mode}".`,
    'Respond with strict JSON only — no markdown, no text outside JSON.',
    'Schema: {"prompt":"<full question text>","topicName":"<max 5 words label>"}',
    'The topicName should be a short label suitable for a history list entry.',
  ].join('\n')

  const result = await model.generateContent(instruction)
  const text = result.response.text()
  const cleaned = text.trimStart().replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim()

  const parsed = JSON.parse(cleaned)
  if (typeof parsed.prompt !== 'string' || typeof parsed.topicName !== 'string') {
    throw new Error('Invalid topic response shape')
  }
  return { prompt: parsed.prompt, topicName: parsed.topicName }
}
```

- [ ] **Step 4: Create `topicRoute.ts`**

Create `apps/api/src/routes/topicRoute.ts`:

```ts
import { Router } from 'express'
import { z } from 'zod'
import { generateTopic } from '../services/geminiClient'
import type { PracticeMode } from '../types'

const FALLBACKS: Record<PracticeMode, { prompt: string; topicName: string }> = {
  thesis: {
    prompt: 'Some people think governments should spend money on railways rather than roads. Discuss both views and give your opinion.',
    topicName: 'Railways vs Roads',
  },
  paragraph: {
    prompt: 'Many believe online education is replacing traditional classrooms. To what extent do you agree or disagree?',
    topicName: 'Online Education',
  },
  miniEssay: {
    prompt: 'In many countries, young people are moving to cities. What are the causes and effects?',
    topicName: 'Youth Migration to Cities',
  },
}

const topicRequestSchema = z.object({
  mode: z.enum(['thesis', 'paragraph', 'miniEssay']),
})

export const topicRoute = Router()

topicRoute.post('/api/topic', async (req, res) => {
  const parsed = topicRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid topic request' })
  }

  try {
    const result = await generateTopic(parsed.data.mode)
    return res.json(result)
  } catch {
    return res.json(FALLBACKS[parsed.data.mode])
  }
})
```

- [ ] **Step 5: Register route in `app.ts`**

Replace the full contents of `apps/api/src/app.ts`:

```ts
import express from 'express'
import { healthRoute } from './routes/healthRoute'
import { feedbackRoute } from './routes/feedbackRoute'
import { topicRoute } from './routes/topicRoute'

export const app = express()
app.use(express.json())
app.use(healthRoute)
app.use(feedbackRoute)
app.use(topicRoute)
```

- [ ] **Step 6: Run API tests to confirm they pass**

```bash
npm --workspace apps/api run test 2>&1 | tail -15
```

Expected: all API tests pass including the new `topicRoute` suite.

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/services/geminiClient.ts apps/api/src/routes/topicRoute.ts apps/api/src/app.ts apps/api/src/__tests__/topicRoute.test.ts
git commit -m "feat: add POST /api/topic endpoint with Gemini topic generation"
```

---

## Task 3 — Storage: migration + `renameRecord`

**Files:**
- Modify: `apps/web/src/lib/storage.ts`
- Modify: `apps/web/src/__tests__/storage.test.ts`

- [ ] **Step 1: Write the new failing tests**

Replace the full contents of `apps/web/src/__tests__/storage.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { loadHistory, savePractice, renameRecord } from '../lib/storage'
import type { PracticeRecord } from '../types'

beforeEach(() => localStorage.clear())

const base: PracticeRecord = {
  id: '1',
  mode: 'thesis',
  prompt: 'Some people think governments should spend money on railways.',
  topicName: 'Railways vs Roads',
  draft: 'The government should invest.',
  feedback: [],
  updatedAt: '2026-04-12T10:00:00.000Z',
}

describe('storage', () => {
  it('rejects empty draft', () => {
    expect(() => savePractice({ ...base, draft: '   ' })).toThrow(/writing text is required/i)
  })

  it('keeps newest first', () => {
    savePractice({ ...base, id: '1', updatedAt: '2026-04-12T10:00:00.000Z' })
    savePractice({ ...base, id: '2', updatedAt: '2026-04-12T11:00:00.000Z' })
    const history = loadHistory()
    expect(history[0].id).toBe('2')
  })

  it('returns empty array when localStorage contains invalid JSON', () => {
    localStorage.setItem('ieltsPrep.v0.1.history', 'not-json{{{')
    expect(loadHistory()).toEqual([])
  })

  it('replaces existing record with same id instead of duplicating', () => {
    savePractice({ ...base, id: '1', draft: 'v1', updatedAt: '2026-04-12T10:00:00.000Z' })
    savePractice({ ...base, id: '1', draft: 'v2', updatedAt: '2026-04-12T11:00:00.000Z' })
    const history = loadHistory()
    expect(history).toHaveLength(1)
    expect(history[0].draft).toBe('v2')
  })

  it('loadHistory fills missing topicName with fallback derived from prompt', () => {
    const old = { id: '99', mode: 'thesis', prompt: 'Some people think governments should act now on climate change.', draft: 'text', feedback: [], updatedAt: '2026-04-10T10:00:00.000Z' }
    localStorage.setItem('ieltsPrep.v0.1.history', JSON.stringify([old]))
    const history = loadHistory()
    expect(history[0].topicName).toBe('Some people think governments should…')
  })

  it('renameRecord updates the topic name and persists to localStorage', () => {
    savePractice(base)
    const updated = renameRecord('1', 'New Name')
    expect(updated[0].topicName).toBe('New Name')
    const reloaded = loadHistory()
    expect(reloaded[0].topicName).toBe('New Name')
  })

  it('renameRecord leaves other records untouched', () => {
    savePractice(base)
    savePractice({ ...base, id: '2', topicName: 'Other Topic', updatedAt: '2026-04-12T11:00:00.000Z' })
    renameRecord('1', 'Renamed')
    const history = loadHistory()
    const other = history.find((r) => r.id === '2')
    expect(other?.topicName).toBe('Other Topic')
  })
})
```

- [ ] **Step 2: Run to confirm `renameRecord` tests fail**

```bash
npm --workspace apps/web run test -- --reporter=verbose 2>&1 | grep -A5 'storage'
```

Expected: `renameRecord` import fails (not exported yet).

- [ ] **Step 3: Update `storage.ts`**

Replace the full contents of `apps/web/src/lib/storage.ts`:

```ts
import type { PracticeRecord } from '../types'

const STORAGE_KEY = 'ieltsPrep.v0.1.history'

function fallbackTopicName(prompt: string): string {
  const words = prompt.split(' ')
  return words.length <= 6 ? prompt : words.slice(0, 6).join(' ') + '…'
}

export function loadHistory(): PracticeRecord[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return (parsed as PracticeRecord[])
      .map((r) => ({ ...r, topicName: r.topicName ?? fallbackTopicName(r.prompt) }))
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  } catch {
    return []
  }
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

export function renameRecord(id: string, newName: string): PracticeRecord[] {
  const updated = loadHistory().map((r) => (r.id === id ? { ...r, topicName: newName } : r))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}
```

- [ ] **Step 4: Run storage tests to confirm all pass**

```bash
npm --workspace apps/web run test -- --reporter=verbose 2>&1 | grep -A10 'storage'
```

Expected: all 7 storage tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/storage.ts apps/web/src/__tests__/storage.test.ts
git commit -m "feat: add topicName migration and renameRecord to storage"
```

---

## Task 4 — `topicApi.ts` fetch wrapper

**Files:**
- Create: `apps/web/src/lib/topicApi.ts`

- [ ] **Step 1: Create `topicApi.ts`**

Create `apps/web/src/lib/topicApi.ts`:

```ts
import type { PracticeMode, TopicResponse } from '../types'

export async function generateTopic(mode: PracticeMode): Promise<TopicResponse> {
  const res = await fetch('/api/topic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode }),
  })
  if (!res.ok) throw new Error('Topic generation failed')
  return res.json() as Promise<TopicResponse>
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /home/khanh/src/0_github/ielts-prep/apps/web && npx tsc --noEmit 2>&1 | grep topicApi
```

Expected: no errors for `topicApi.ts`.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/lib/topicApi.ts
git commit -m "feat: add topicApi fetch wrapper for topic generation"
```

---

## Task 5 — `TopicPicker` component (TDD)

**Files:**
- Create: `apps/web/src/components/TopicPicker.tsx`
- Create: `apps/web/src/__tests__/TopicPicker.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `apps/web/src/__tests__/TopicPicker.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TopicPicker } from '../components/TopicPicker'
import * as topicApi from '../lib/topicApi'

const baseProps = {
  mode: 'thesis' as const,
  prompt: 'Some people think governments should spend money on railways rather than roads. Discuss both views and give your opinion.',
  topicName: 'Railways vs Roads',
  onTopicChange: vi.fn(),
}

beforeEach(() => vi.clearAllMocks())

describe('TopicPicker', () => {
  it('renders 4 chip buttons for thesis mode', () => {
    render(<TopicPicker {...baseProps} />)
    expect(screen.getByRole('button', { name: 'Railways vs Roads' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Compulsory Community Service' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Crime & Prison Sentences' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Social Media Impact' })).toBeInTheDocument()
  })

  it('active chip has aria-pressed=true', () => {
    render(<TopicPicker {...baseProps} />)
    expect(screen.getByRole('button', { name: 'Railways vs Roads' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Social Media Impact' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('clicking a chip calls onTopicChange with that entry prompt and name', async () => {
    const user = userEvent.setup()
    const onTopicChange = vi.fn()
    render(<TopicPicker {...baseProps} onTopicChange={onTopicChange} />)
    await user.click(screen.getByRole('button', { name: 'Social Media Impact' }))
    expect(onTopicChange).toHaveBeenCalledWith(
      'Many people think that social media has had a largely negative effect on society. To what extent do you agree or disagree?',
      'Social Media Impact',
    )
  })

  it('Generate button calls generateTopic and passes result to onTopicChange', async () => {
    const user = userEvent.setup()
    const onTopicChange = vi.fn()
    vi.spyOn(topicApi, 'generateTopic').mockResolvedValueOnce({
      prompt: 'AI generated prompt.',
      topicName: 'AI Topic',
    })
    render(<TopicPicker {...baseProps} onTopicChange={onTopicChange} />)
    await user.click(screen.getByRole('button', { name: /generate new/i }))
    expect(onTopicChange).toHaveBeenCalledWith('AI generated prompt.', 'AI Topic')
  })

  it('shows error message when generateTopic fails', async () => {
    const user = userEvent.setup()
    vi.spyOn(topicApi, 'generateTopic').mockRejectedValueOnce(new Error('Network error'))
    render(<TopicPicker {...baseProps} />)
    await user.click(screen.getByRole('button', { name: /generate new/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't generate topic")
  })

  it('session name input shows current topicName', () => {
    render(<TopicPicker {...baseProps} />)
    expect(screen.getByLabelText('Session name')).toHaveValue('Railways vs Roads')
  })

  it('typing in session name calls onTopicChange with same prompt and new name', async () => {
    const user = userEvent.setup()
    const onTopicChange = vi.fn()
    render(<TopicPicker {...baseProps} onTopicChange={onTopicChange} />)
    const input = screen.getByLabelText('Session name')
    await user.clear(input)
    await user.type(input, 'X')
    expect(onTopicChange).toHaveBeenLastCalledWith(baseProps.prompt, expect.stringContaining('X'))
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm --workspace apps/web run test -- --reporter=verbose 2>&1 | grep -A5 'TopicPicker'
```

Expected: fails — "Cannot find module '../components/TopicPicker'".

- [ ] **Step 3: Implement `TopicPicker.tsx`**

Create `apps/web/src/components/TopicPicker.tsx`:

```tsx
import { useState } from 'react'
import type { PracticeMode } from '../types'
import { PROMPT_BANK } from '../lib/promptBank'
import { generateTopic } from '../lib/topicApi'

interface TopicPickerProps {
  mode: PracticeMode
  prompt: string
  topicName: string
  onTopicChange: (prompt: string, topicName: string) => void
}

export function TopicPicker({ mode, prompt, topicName, onTopicChange }: TopicPickerProps) {
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

  async function handleGenerate() {
    setGenerating(true)
    setGenerateError(null)
    try {
      const result = await generateTopic(mode)
      onTopicChange(result.prompt, result.topicName)
    } catch {
      setGenerateError("Couldn't generate topic. Try again.")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">Topic</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {PROMPT_BANK[mode].map((entry) => (
          <button
            key={entry.topicName}
            type="button"
            onClick={() => onTopicChange(entry.prompt, entry.topicName)}
            aria-pressed={topicName === entry.topicName}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              topicName === entry.topicName
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {entry.topicName}
          </button>
        ))}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="rounded-full px-3 py-1 text-xs font-medium border border-dashed border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-50 transition-colors"
        >
          {generating ? 'Generating…' : '✨ Generate new…'}
        </button>
      </div>
      {generateError && (
        <p role="alert" className="text-xs text-red-600 mb-2">{generateError}</p>
      )}
      <div className="flex items-center gap-2">
        <label htmlFor="topic-name" className="text-xs text-slate-400 whitespace-nowrap">Session name</label>
        <input
          id="topic-name"
          type="text"
          value={topicName}
          onChange={(e) => onTopicChange(prompt, e.target.value)}
          className="flex-1 text-sm border border-slate-200 rounded-md px-2 py-1 text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to confirm all 7 pass**

```bash
npm --workspace apps/web run test -- --reporter=verbose 2>&1 | grep -A10 'TopicPicker'
```

Expected: all 7 `TopicPicker` tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/TopicPicker.tsx apps/web/src/__tests__/TopicPicker.test.tsx
git commit -m "feat: add TopicPicker component with chips, generate, and session name"
```

---

## Task 6 — Update `SavePracticeButton` to include `topicName`

**Files:**
- Modify: `apps/web/src/components/SavePracticeButton.tsx`

- [ ] **Step 1: Update `SavePracticeButton.tsx`**

Replace the full contents of `apps/web/src/components/SavePracticeButton.tsx`:

```tsx
import { useState } from 'react'
import type { PracticeMode, FeedbackUnit, PracticeRecord } from '../types'
import { savePractice } from '../lib/storage'

interface SavePracticeButtonProps {
  draft: string
  mode: PracticeMode
  prompt: string
  topicName: string
  feedback: FeedbackUnit[]
  sessionId: string
  onSaved: (history: PracticeRecord[]) => void
}

export function SavePracticeButton({ draft, mode, prompt, topicName, feedback, sessionId, onSaved }: SavePracticeButtonProps) {
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    setError(null)
    try {
      const history = savePractice({
        id: sessionId,
        mode,
        prompt,
        topicName,
        draft,
        feedback,
        updatedAt: new Date().toISOString(),
      })
      onSaved(history)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to save practice')
      }
    }
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleSave}
        className="w-full sm:w-auto px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
      >
        Save Practice
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 2: Run full web test suite**

```bash
npm --workspace apps/web run test 2>&1 | tail -15
```

Expected: tests that use `App` (practiceFlow) may fail because `App.tsx` still passes the old props. That is fine — it will be fixed in Task 8. All other tests pass.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/SavePracticeButton.tsx
git commit -m "feat: add topicName prop to SavePracticeButton"
```

---

## Task 7 — Update `HistoryList`: topic name display + inline rename (TDD)

**Files:**
- Create: `apps/web/src/__tests__/HistoryList.test.tsx`
- Modify: `apps/web/src/components/HistoryList.tsx`

- [ ] **Step 1: Write the failing tests**

Create `apps/web/src/__tests__/HistoryList.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HistoryList } from '../components/HistoryList'
import type { PracticeRecord } from '../types'

const record: PracticeRecord = {
  id: 'r1',
  mode: 'thesis',
  prompt: 'Some people think governments should spend money on railways.',
  topicName: 'Railways vs Roads',
  draft: 'The government should invest.',
  feedback: [],
  updatedAt: '2026-04-22T10:00:00.000Z',
}

describe('HistoryList', () => {
  it('renders nothing when history is empty', () => {
    const { container } = render(
      <HistoryList history={[]} onSelect={vi.fn()} onRename={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('shows topicName for each record', () => {
    render(<HistoryList history={[record]} onSelect={vi.fn()} onRename={vi.fn()} />)
    expect(screen.getByText('Railways vs Roads')).toBeInTheDocument()
  })

  it('clicking the topic name shows an edit input with current value', async () => {
    const user = userEvent.setup()
    render(<HistoryList history={[record]} onSelect={vi.fn()} onRename={vi.fn()} />)
    await user.click(screen.getByText('Railways vs Roads'))
    expect(screen.getByDisplayValue('Railways vs Roads')).toBeInTheDocument()
  })

  it('blurring the input calls onRename with the new value', async () => {
    const user = userEvent.setup()
    const onRename = vi.fn()
    render(<HistoryList history={[record]} onSelect={vi.fn()} onRename={onRename} />)
    await user.click(screen.getByText('Railways vs Roads'))
    const input = screen.getByDisplayValue('Railways vs Roads')
    await user.clear(input)
    await user.type(input, 'New Topic Name')
    await user.tab()
    expect(onRename).toHaveBeenCalledWith('r1', 'New Topic Name')
  })

  it('pressing Enter commits the rename', async () => {
    const user = userEvent.setup()
    const onRename = vi.fn()
    render(<HistoryList history={[record]} onSelect={vi.fn()} onRename={onRename} />)
    await user.click(screen.getByText('Railways vs Roads'))
    const input = screen.getByDisplayValue('Railways vs Roads')
    await user.clear(input)
    await user.type(input, 'Another Name{Enter}')
    expect(onRename).toHaveBeenCalledWith('r1', 'Another Name')
  })

  it('pressing Escape cancels edit without calling onRename', async () => {
    const user = userEvent.setup()
    const onRename = vi.fn()
    render(<HistoryList history={[record]} onSelect={vi.fn()} onRename={onRename} />)
    await user.click(screen.getByText('Railways vs Roads'))
    await user.keyboard('{Escape}')
    expect(onRename).not.toHaveBeenCalled()
    expect(screen.getByText('Railways vs Roads')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm --workspace apps/web run test -- --reporter=verbose 2>&1 | grep -A5 'HistoryList'
```

Expected: fails — `HistoryList` doesn't accept `onRename` prop yet.

- [ ] **Step 3: Update `HistoryList.tsx`**

Replace the full contents of `apps/web/src/components/HistoryList.tsx`:

```tsx
import { useState } from 'react'
import type { PracticeRecord } from '../types'

interface HistoryListProps {
  history: PracticeRecord[]
  onSelect: (record: PracticeRecord) => void
  onRename: (id: string, newName: string) => void
}

export function HistoryList({ history, onSelect, onRename }: HistoryListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')

  if (history.length === 0) return null

  function startEdit(record: PracticeRecord) {
    setEditingId(record.id)
    setEditingValue(record.topicName)
  }

  function commitEdit(id: string) {
    const trimmed = editingValue.trim()
    if (trimmed) onRename(id, trimmed)
    setEditingId(null)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  const modeLabel = (mode: PracticeRecord['mode']) =>
    mode === 'thesis' ? 'Thesis' : mode === 'paragraph' ? 'Paragraph' : 'Mini Essay'

  return (
    <div>
      <h2 className="text-base font-semibold text-slate-900 mb-3 mt-6">History</h2>
      <ul className="space-y-1">
        {history.map((record) => (
          <li key={record.id} className="border-b border-slate-100 last:border-0">
            <div className="py-2.5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => onSelect(record)}
                className="shrink-0"
              >
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                  {modeLabel(record.mode)}
                </span>
              </button>
              {editingId === record.id ? (
                <input
                  type="text"
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onBlur={() => commitEdit(record.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitEdit(record.id)
                    if (e.key === 'Escape') cancelEdit()
                  }}
                  autoFocus
                  className="flex-1 text-sm border border-indigo-400 rounded px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={() => startEdit(record)}
                  onKeyDown={(e) => e.key === 'Enter' && startEdit(record)}
                  className="flex-1 text-sm text-slate-700 cursor-text hover:text-indigo-600 transition-colors"
                >
                  {record.topicName}
                </span>
              )}
              <span className="text-xs text-slate-400 shrink-0">
                {new Date(record.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to confirm all 6 pass**

```bash
npm --workspace apps/web run test -- --reporter=verbose 2>&1 | grep -A10 'HistoryList'
```

Expected: all 6 `HistoryList` tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/HistoryList.tsx apps/web/src/__tests__/HistoryList.test.tsx
git commit -m "feat: update HistoryList with topic name display and inline rename"
```

---

## Task 8 — Wire everything in `App.tsx`

**Files:**
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/__tests__/practiceFlow.test.tsx`

- [ ] **Step 1: Update `practiceFlow.test.tsx` history assertion**

In `apps/web/src/__tests__/practiceFlow.test.tsx`, line 59, find:

```ts
const historyEntry = await screen.findByRole('button', { name: /—\s*thesis/i })
expect(historyEntry).toBeInTheDocument()
```

Replace with:

```ts
expect(await screen.findByText('Railways vs Roads')).toBeInTheDocument()
```

Also, the `fetch` mock in practiceFlow intercepts ALL fetches. The `TopicPicker` component only calls `generateTopic` when the user clicks Generate, so the existing tests that don't click Generate are unaffected. No other changes needed in practiceFlow.

- [ ] **Step 2: Replace `App.tsx`**

Replace the full contents of `apps/web/src/App.tsx`:

```tsx
import { useState } from 'react'
import type { PracticeMode, FeedbackLevel, FeedbackUnit, PracticeRecord } from './types'
import { requestFeedback } from './lib/api'
import { PROMPT_BANK } from './lib/promptBank'
import { loadHistory, renameRecord } from './lib/storage'
import { ModePicker } from './components/ModePicker'
import { TopicPicker } from './components/TopicPicker'
import { PromptCard } from './components/PromptCard'
import { DraftEditor } from './components/DraftEditor'
import { FeedbackPanel } from './components/FeedbackPanel'
import { SavePracticeButton } from './components/SavePracticeButton'
import { HistoryList } from './components/HistoryList'

export default function App() {
  const [mode, setMode] = useState<PracticeMode>('thesis')
  const [prompt, setPrompt] = useState(PROMPT_BANK['thesis'][0].prompt)
  const [topicName, setTopicName] = useState(PROMPT_BANK['thesis'][0].topicName)
  const [draft, setDraft] = useState('')
  const [feedback, setFeedback] = useState<FeedbackUnit[]>([])
  const [loading, setLoading] = useState(false)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)
  const [history, setHistory] = useState<PracticeRecord[]>(() => loadHistory())
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID())

  function handleTopicChange(newPrompt: string, newTopicName: string) {
    setPrompt(newPrompt)
    setTopicName(newTopicName)
  }

  function handleModeChange(newMode: PracticeMode) {
    setMode(newMode)
    setPrompt(PROMPT_BANK[newMode][0].prompt)
    setTopicName(PROMPT_BANK[newMode][0].topicName)
    setDraft('')
    setFeedback([])
    setFeedbackError(null)
    setSessionId(crypto.randomUUID())
  }

  async function handleCheck(level: FeedbackLevel) {
    setLoading(true)
    setFeedbackError(null)
    try {
      const result = await requestFeedback({ mode, level, text: draft, prompt })
      setFeedback(result.feedback ?? [])
    } catch {
      setFeedbackError('Feedback service unavailable. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleSaved(newHistory: PracticeRecord[]) {
    setHistory(newHistory)
  }

  function handleSelectRecord(record: PracticeRecord) {
    setMode(record.mode)
    setPrompt(record.prompt)
    setTopicName(record.topicName)
    setDraft(record.draft)
    setFeedback(record.feedback)
    setFeedbackError(null)
  }

  function handleRenameRecord(id: string, newName: string) {
    setHistory(renameRecord(id, newName))
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">IELTS Writing Prep</h1>
        <main className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6">
          <div>
            <ModePicker mode={mode} onModeChange={handleModeChange} />
            <div className="mt-6">
              <TopicPicker
                mode={mode}
                prompt={prompt}
                topicName={topicName}
                onTopicChange={handleTopicChange}
              />
            </div>
            <div className="mt-4">
              <PromptCard prompt={prompt} />
            </div>
            <div className="mt-6">
              <DraftEditor draft={draft} onChange={setDraft} />
            </div>
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => handleCheck('sentence')}
                disabled={loading}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Checking...' : 'Check Sentence'}
              </button>
              <button
                onClick={() => handleCheck('paragraph')}
                disabled={loading}
                className="px-4 py-2 rounded-md bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:border-indigo-300 hover:text-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Checking...' : 'Check Paragraph'}
              </button>
            </div>
            {feedbackError && (
              <p role="alert" className="mt-3 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {feedbackError}
              </p>
            )}
            <SavePracticeButton
              draft={draft}
              mode={mode}
              prompt={prompt}
              topicName={topicName}
              feedback={feedback}
              sessionId={sessionId}
              onSaved={handleSaved}
            />
          </div>

          <div>
            <div className="sticky top-6">
              <FeedbackPanel feedback={feedback} draft={draft} />
              <HistoryList
                history={history}
                onSelect={handleSelectRecord}
                onRename={handleRenameRecord}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Run full web test suite**

```bash
npm --workspace apps/web run test 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/App.tsx apps/web/src/__tests__/practiceFlow.test.tsx
git commit -m "feat: wire TopicPicker, topicName state, and history rename in App"
```

---

## Task 9 — Delete history entries

**Files:**
- Modify: `apps/web/src/lib/storage.ts`
- Modify: `apps/web/src/__tests__/storage.test.ts`
- Modify: `apps/web/src/components/HistoryList.tsx`
- Modify: `apps/web/src/__tests__/HistoryList.test.tsx`
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Add `deleteRecord` tests to `storage.test.ts`**

In `apps/web/src/__tests__/storage.test.ts`, append inside the `describe` block:

```ts
describe('deleteRecord', () => {
  it('removes the matching record and returns updated array', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { id: 'a', mode: 'thesis', topicName: 'T1', prompt: 'p', draft: 'd', feedback: [], updatedAt: '2026-01-01T00:00:00.000Z' },
        { id: 'b', mode: 'paragraph', topicName: 'T2', prompt: 'p', draft: 'd', feedback: [], updatedAt: '2026-01-01T00:00:00.000Z' },
      ]),
    )
    const result = deleteRecord('a')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('b')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toHaveLength(1)
  })

  it('returns unchanged array when id not found', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { id: 'a', mode: 'thesis', topicName: 'T1', prompt: 'p', draft: 'd', feedback: [], updatedAt: '2026-01-01T00:00:00.000Z' },
      ]),
    )
    const result = deleteRecord('missing')
    expect(result).toHaveLength(1)
  })
})
```

Also import `deleteRecord` at the top of the test file alongside the other imports:

```ts
import { savePractice, loadHistory, renameRecord, deleteRecord } from '../lib/storage'
```

- [ ] **Step 2: Run storage tests to confirm failure**

```bash
npm --workspace apps/web run test -- --reporter=verbose 2>&1 | grep -A5 'deleteRecord'
```

Expected: fails — `deleteRecord` is not exported from `storage.ts`.

- [ ] **Step 3: Add `deleteRecord` to `storage.ts`**

In `apps/web/src/lib/storage.ts`, add after the `renameRecord` function:

```ts
export function deleteRecord(id: string): PracticeRecord[] {
  const records = loadHistory()
  const updated = records.filter((r) => r.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}
```

- [ ] **Step 4: Run storage tests to confirm they pass**

```bash
npm --workspace apps/web run test -- --reporter=verbose 2>&1 | grep -A10 'deleteRecord'
```

Expected: all `deleteRecord` tests pass.

- [ ] **Step 5: Add delete test to `HistoryList.test.tsx`**

In `apps/web/src/__tests__/HistoryList.test.tsx`, add this test inside the `describe('HistoryList')` block:

```ts
it('clicking the delete button calls onDelete with the record id', async () => {
  const user = userEvent.setup()
  const onDelete = vi.fn()
  render(
    <HistoryList history={[record]} onSelect={vi.fn()} onRename={vi.fn()} onDelete={onDelete} />
  )
  await user.click(screen.getByRole('button', { name: /delete/i }))
  expect(onDelete).toHaveBeenCalledWith('r1')
})
```

Also update the existing renders that don't pass `onDelete` to pass a no-op stub so they still compile:

Find all existing `render(<HistoryList ... />)` calls that don't include `onDelete` and add `onDelete={vi.fn()}` to each.

- [ ] **Step 6: Run HistoryList tests to confirm the new test fails**

```bash
npm --workspace apps/web run test -- --reporter=verbose 2>&1 | grep -A5 'delete button'
```

Expected: fails — `onDelete` prop not accepted yet.

- [ ] **Step 7: Update `HistoryList.tsx` to add delete button**

In `apps/web/src/components/HistoryList.tsx`, update the `HistoryListProps` interface and component:

```tsx
interface HistoryListProps {
  history: PracticeRecord[]
  onSelect: (record: PracticeRecord) => void
  onRename: (id: string, newName: string) => void
  onDelete: (id: string) => void
}

export function HistoryList({ history, onSelect, onRename, onDelete }: HistoryListProps) {
```

Add a delete button after the topic name span/input, inside each list item's flex row, just before the date `<span>`:

```tsx
<button
  type="button"
  onClick={() => onDelete(record.id)}
  aria-label="Delete"
  className="shrink-0 text-slate-300 hover:text-red-500 transition-colors text-sm px-1"
>
  ×
</button>
```

- [ ] **Step 8: Run HistoryList tests to confirm all pass**

```bash
npm --workspace apps/web run test -- --reporter=verbose 2>&1 | grep -A12 'HistoryList'
```

Expected: all HistoryList tests pass including the new delete test.

- [ ] **Step 9: Wire `onDelete` in `App.tsx`**

In `apps/web/src/App.tsx`, add `deleteRecord` to the storage import:

```ts
import { loadHistory, renameRecord, deleteRecord } from './lib/storage'
```

Add the handler function inside `App()` alongside `handleRenameRecord`:

```ts
function handleDeleteRecord(id: string) {
  setHistory(deleteRecord(id))
}
```

Add `onDelete={handleDeleteRecord}` to the `<HistoryList>` call:

```tsx
<HistoryList
  history={history}
  onSelect={handleSelectRecord}
  onRename={handleRenameRecord}
  onDelete={handleDeleteRecord}
/>
```

- [ ] **Step 10: Run full web tests**

```bash
npm --workspace apps/web run test 2>&1 | tail -10
```

Expected: all tests pass.

- [ ] **Step 11: Commit**

```bash
git add apps/web/src/lib/storage.ts apps/web/src/__tests__/storage.test.ts apps/web/src/components/HistoryList.tsx apps/web/src/__tests__/HistoryList.test.tsx apps/web/src/App.tsx
git commit -m "feat: add delete record to history"
```

---

## Task 10 — Verify

- [ ] **Step 1: Run all tests (both workspaces)**

```bash
npm run test 2>&1 | tail -20
```

Expected: all tests pass in both `apps/api` and `apps/web`.

- [ ] **Step 2: Manual smoke test**

```bash
npm run dev
```

Open http://localhost:5173 and verify:
1. `TopicPicker` chips appear for the selected mode — clicking one updates `PromptCard`
2. Session name field shows the chip's `topicName` and is editable
3. "✨ Generate new…" button shows loading state and (if API key is set) updates the topic
4. After getting feedback and saving, the history entry shows the topic name
5. Clicking the topic name in history turns it into an editable input; blur/Enter persists the rename
6. Selecting a history entry restores the topic, prompt, draft, and feedback

- [ ] **Step 3: Commit if any fixes needed**

If no fixes needed during smoke test, no extra commit required.
