import request from 'supertest'
import { describe, it, expect, vi } from 'vitest'
import { app } from '../app'

vi.mock('../services/geminiClient', () => ({
  getGeminiFeedback: vi.fn(async () => ({
    feedback: [
      {
        targetText: 'Governments should invest in rail.',
        strengths: ['clear thesis'],
        issues: ['minor grammar'],
        revision: {
          explanation: 'Tighten the verb phrase for concision.',
          rewrites: [
            'Governments ought to invest substantially in rail infrastructure.',
            'Rail investment should be a government priority.',
          ],
        },
      },
    ],
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
    expect(res.body.feedback[0].revision.explanation).toBe('Tighten the verb phrase for concision.')
    expect(Array.isArray(res.body.feedback[0].revision.rewrites)).toBe(true)
    expect(res.body.feedback[0].revision.rewrites.length).toBeGreaterThan(0)
  })

  it('returns 400 for invalid request', async () => {
    const res = await request(app).post('/api/feedback').send({ mode: 'invalid' })
    expect(res.status).toBe(400)
  })

  it('returns 502 when gemini client throws', async () => {
    const { getGeminiFeedback } = await import('../services/geminiClient')
    vi.mocked(getGeminiFeedback).mockRejectedValueOnce(new Error('network error'))

    const res = await request(app).post('/api/feedback').send({
      mode: 'thesis',
      level: 'sentence',
      text: 'Some text.',
      prompt: 'Some prompt.',
    })

    expect(res.status).toBe(502)
    expect(res.body.error).toBe('Feedback service unavailable')
  })
})
