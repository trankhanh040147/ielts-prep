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
