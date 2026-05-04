import { describe, it, expect } from 'vitest'
import { mapGeminiToFeedback } from '../services/feedbackMapper'

describe('mapGeminiToFeedback', () => {
  it('maps valid payload with revision fields', () => {
    const raw = {
      feedback: [
        {
          targetText: 'The government should taking action.',
          strengths: ['clear argument'],
          issues: ['grammar error'],
          revision: {
            explanation: 'Modal verbs take bare infinitive.',
            rewrites: ['The government should take action.', 'The government must take action.'],
          },
        },
      ],
    }
    const out = mapGeminiToFeedback(raw, 'sentence', 'fallback')
    expect(out).toHaveLength(1)
    expect(out[0].level).toBe('sentence')
    expect(out[0].targetText).toBe('The government should taking action.')
    expect(out[0].strengths).toEqual(['clear argument'])
    expect(out[0].issues).toEqual(['grammar error'])
    expect(out[0].revision.explanation).toBe('Modal verbs take bare infinitive.')
    expect(out[0].revision.rewrites).toEqual([
      'The government should take action.',
      'The government must take action.',
    ])
  })

  it('reads targetText from each item, not the fallback', () => {
    const raw = {
      feedback: [
        { targetText: 'First sentence.', strengths: [], issues: [], revision: { explanation: 'e1', rewrites: ['r1'] } },
        { targetText: 'Second sentence.', strengths: [], issues: [], revision: { explanation: 'e2', rewrites: ['r2'] } },
      ],
    }
    const out = mapGeminiToFeedback(raw, 'sentence', 'fallback')
    expect(out[0].targetText).toBe('First sentence.')
    expect(out[1].targetText).toBe('Second sentence.')
  })

  it('falls back to fallbackText when item has no targetText', () => {
    const raw = {
      feedback: [{ strengths: [], issues: [], revision: { explanation: 'e', rewrites: [] } }],
    }
    const out = mapGeminiToFeedback(raw, 'paragraph', 'The whole draft.')
    expect(out[0].targetText).toBe('The whole draft.')
  })

  it('returns fallback unit when feedback array is missing', () => {
    const out = mapGeminiToFeedback({}, 'sentence', 'fallback')
    expect(out).toHaveLength(1)
    expect(out[0].revision.explanation.length).toBeGreaterThan(0)
    expect(Array.isArray(out[0].revision.rewrites)).toBe(true)
  })

  it('returns fallback unit when payload is a primitive', () => {
    const out = mapGeminiToFeedback(42, 'sentence', 'fallback')
    expect(out).toHaveLength(1)
    expect(out[0].revision.explanation.length).toBeGreaterThan(0)
  })

  it('returns empty array when feedback is an empty array', () => {
    const out = mapGeminiToFeedback({ feedback: [] }, 'sentence', 'fallback')
    expect(out).toHaveLength(0)
  })

  it('filters non-string values from strengths and issues', () => {
    const raw = {
      feedback: [
        {
          targetText: 'text',
          strengths: [1, true, 'ok'],
          issues: ['bad', null],
          revision: { explanation: 'fix it', rewrites: ['better'] },
        },
      ],
    }
    const out = mapGeminiToFeedback(raw, 'sentence', 'text')
    expect(out[0].strengths).toEqual(['ok'])
    expect(out[0].issues).toEqual(['bad'])
  })

  it('normalizes missing revision to defaults', () => {
    const raw = {
      feedback: [{ targetText: 'text', strengths: [], issues: [] }],
    }
    const out = mapGeminiToFeedback(raw, 'sentence', 'text')
    expect(out[0].revision.explanation).toBe('Revise for clearer logic and grammar.')
    expect(out[0].revision.rewrites).toEqual([])
  })
})

describe('mapGeminiToBandEstimate', () => {
  it('maps and rounds a valid band estimate', async () => {
    const { mapGeminiToBandEstimate } = await import('../services/feedbackMapper')
    const out = mapGeminiToBandEstimate({
      bandEstimate: {
        overall: 6.74,
        taskAchievement: '6.2',
        coherenceCohesion: 7,
        lexicalResource: 6.5,
        grammaticalRangeAccuracy: 6,
        summary: 'Clear answer with some grammar weaknesses.',
      },
    })

    expect(out).toEqual({
      overall: 6.5,
      taskAchievement: 6,
      coherenceCohesion: 7,
      lexicalResource: 6.5,
      grammaticalRangeAccuracy: 6,
      summary: 'Clear answer with some grammar weaknesses.',
    })
  })

  it('clamps out-of-range scores and supplies default summary', async () => {
    const { mapGeminiToBandEstimate } = await import('../services/feedbackMapper')
    const out = mapGeminiToBandEstimate({
      bandEstimate: {
        overall: 12,
        taskAchievement: -1,
        coherenceCohesion: 8.25,
        lexicalResource: 5.75,
        grammaticalRangeAccuracy: 6.25,
        summary: '   ',
      },
    })

    expect(out).toEqual({
      overall: 9,
      taskAchievement: 0,
      coherenceCohesion: 8.5,
      lexicalResource: 6,
      grammaticalRangeAccuracy: 6.5,
      summary: 'Estimated IELTS band based on this draft.',
    })
  })

  it('returns undefined when band estimate is missing or incomplete', async () => {
    const { mapGeminiToBandEstimate } = await import('../services/feedbackMapper')
    expect(mapGeminiToBandEstimate({})).toBeUndefined()
    expect(mapGeminiToBandEstimate({ bandEstimate: { overall: 6 } })).toBeUndefined()
    expect(mapGeminiToBandEstimate({ bandEstimate: { overall: 'six' } })).toBeUndefined()
  })
})
