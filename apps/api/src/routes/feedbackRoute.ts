import { Router } from 'express'
import { z } from 'zod'
import { getGeminiFeedback } from '../services/geminiClient'
import { mapGeminiToFeedback } from '../services/feedbackMapper'

const feedbackRequestSchema = z.object({
  mode: z.enum(['thesis', 'paragraph', 'miniEssay']),
  level: z.enum(['sentence', 'paragraph']),
  text: z.string().min(1),
  prompt: z.string().min(1),
})

export const feedbackRoute = Router()

feedbackRoute.post('/api/feedback', async (req, res) => {
  const parsed = feedbackRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid feedback request' })
  }

  try {
    const raw = await getGeminiFeedback(parsed.data)
    const feedback = mapGeminiToFeedback(raw, parsed.data.level, parsed.data.text)
    return res.json({ feedback })
  } catch {
    return res.status(502).json({ error: 'Feedback service unavailable' })
  }
})
