import { describe, it, expect, beforeEach } from 'vitest'
import { loadHistory, savePractice, renameRecord } from '../lib/storage'

const STORAGE_KEY = 'ieltsPrep.v0.1.history'

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

describe('loadHistory — topicName migration', () => {
  it('fills in fallback topicName for records without one', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: 'x',
          mode: 'thesis',
          prompt: 'Some people think word one two three four five six seven.',
          draft: 'd',
          feedback: [],
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ]),
    )
    const result = loadHistory()
    expect(result[0].topicName).toBe('Some people think word one two…')
  })

  it('preserves existing topicName', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: 'y',
          mode: 'thesis',
          topicName: 'My Topic',
          prompt: 'A long prompt here.',
          draft: 'd',
          feedback: [],
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ]),
    )
    const result = loadHistory()
    expect(result[0].topicName).toBe('My Topic')
  })
})

describe('renameRecord', () => {
  it('updates topicName for the matching record and saves', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { id: 'a', mode: 'thesis', topicName: 'Old Name', prompt: 'p', draft: 'd', feedback: [], updatedAt: '2026-01-01T00:00:00.000Z' },
        { id: 'b', mode: 'paragraph', topicName: 'Other', prompt: 'p', draft: 'd', feedback: [], updatedAt: '2026-01-01T00:00:01.000Z' },
      ]),
    )
    const result = renameRecord('a', 'New Name')
    expect(result).toHaveLength(2)
    expect(result.find((r) => r.id === 'a')!.topicName).toBe('New Name')
    expect(result.find((r) => r.id === 'b')!.topicName).toBe('Other')
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(saved.find((r: { id: string }) => r.id === 'a')!.topicName).toBe('New Name')
  })

  it('returns unchanged array when id not found', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { id: 'a', mode: 'thesis', topicName: 'Name', prompt: 'p', draft: 'd', feedback: [], updatedAt: '2026-01-01T00:00:00.000Z' },
      ]),
    )
    const result = renameRecord('missing', 'New Name')
    expect(result).toHaveLength(1)
    expect(result[0].topicName).toBe('Name')
  })
})
