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
