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

  it('returns 400 for invalid request', async () => {
    const res = await request(app).post('/api/feedback').send({ mode: 'invalid' })
    expect(res.status).toBe(400)
  })
})
