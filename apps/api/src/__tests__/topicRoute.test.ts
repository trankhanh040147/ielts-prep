import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../app'
import * as geminiClient from '../services/geminiClient'

describe('POST /api/topic', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('returns 400 for invalid mode', async () => {
    const res = await request(app).post('/api/topic').send({ mode: 'invalid' })
    expect(res.status).toBe(400)
  })

  it('returns 400 when mode is missing', async () => {
    const res = await request(app).post('/api/topic').send({})
    expect(res.status).toBe(400)
  })

  it('returns prompt and topicName for valid mode', async () => {
    vi.spyOn(geminiClient, 'generateTopic').mockResolvedValueOnce({
      prompt: 'Mock prompt.',
      topicName: 'Mock Topic',
    })
    const res = await request(app).post('/api/topic').send({ mode: 'thesis' })
    expect(res.status).toBe(200)
    expect(res.body.prompt).toBe('Mock prompt.')
    expect(res.body.topicName).toBe('Mock Topic')
  })

  it('returns fallback when generateTopic throws', async () => {
    vi.spyOn(geminiClient, 'generateTopic').mockRejectedValueOnce(new Error('Gemini down'))
    const res = await request(app).post('/api/topic').send({ mode: 'thesis' })
    expect(res.status).toBe(200)
    expect(res.body.prompt).toBe('Some people think governments should spend money on railways rather than roads. Discuss both views and give your opinion.')
    expect(res.body.topicName).toBe('Railways vs Roads')
  })
})
