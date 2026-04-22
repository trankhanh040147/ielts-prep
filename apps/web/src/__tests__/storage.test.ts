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
        topicName: 'Test Topic',
        draft: '   ',
        feedback: [],
        updatedAt: '2026-04-12T11:00:00.000Z',
      }),
    ).toThrow(/writing text is required/i)
  })

  it('keeps newest first', () => {
    savePractice({ id: '1', mode: 'thesis', prompt: 'p', topicName: 'Topic 1', draft: 'old', feedback: [], updatedAt: '2026-04-12T10:00:00.000Z' })
    savePractice({ id: '2', mode: 'thesis', prompt: 'p', topicName: 'Topic 2', draft: 'new', feedback: [], updatedAt: '2026-04-12T11:00:00.000Z' })
    const history = loadHistory()
    expect(history[0].id).toBe('2')
  })

  it('returns empty array when localStorage contains invalid JSON', () => {
    localStorage.setItem('ieltsPrep.v0.1.history', 'not-json{{{')
    expect(loadHistory()).toEqual([])
  })

  it('replaces existing record with same id instead of duplicating', () => {
    savePractice({ id: '1', mode: 'thesis', prompt: 'p', topicName: 'Topic 1', draft: 'v1', feedback: [], updatedAt: '2026-04-12T10:00:00.000Z' })
    savePractice({ id: '1', mode: 'thesis', prompt: 'p', topicName: 'Topic 1', draft: 'v2', feedback: [], updatedAt: '2026-04-12T11:00:00.000Z' })
    const history = loadHistory()
    expect(history).toHaveLength(1)
    expect(history[0].draft).toBe('v2')
  })
})
