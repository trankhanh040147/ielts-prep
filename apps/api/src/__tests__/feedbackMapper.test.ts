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
    expect(out[0].strengths).toEqual(['clear'])
    expect(out[0].issues).toEqual(['grammar'])
    expect(out[0].revisionHint).toBe('improve verb tense')
  })

  it('returns fallback when payload is invalid', () => {
    const out = mapGeminiToFeedback({}, 'paragraph', 'Paragraph text')
    expect(out).toHaveLength(1)
    expect(out[0].revisionHint.length).toBeGreaterThan(0)
  })

  it('returns fallback when feedback is null', () => {
    const out = mapGeminiToFeedback({ feedback: null }, 'sentence', 'text')
    expect(out).toHaveLength(1)
    expect(out[0].revisionHint.length).toBeGreaterThan(0)
  })

  it('returns fallback when input is a primitive', () => {
    const out = mapGeminiToFeedback(42, 'sentence', 'text')
    expect(out).toHaveLength(1)
  })

  it('returns empty array when feedback is an empty array', () => {
    const out = mapGeminiToFeedback({ feedback: [] }, 'sentence', 'text')
    expect(out).toHaveLength(0)
  })

  it('filters non-string values from strengths and issues', () => {
    const raw = {
      feedback: [{ strengths: [1, true, 'ok'], issues: ['bad', null], revisionHint: 'fix it' }],
    }
    const out = mapGeminiToFeedback(raw, 'paragraph', 'text')
    expect(out[0].strengths).toEqual(['ok'])
    expect(out[0].issues).toEqual(['bad'])
  })
})
