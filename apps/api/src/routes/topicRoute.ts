import { Router } from 'express'
import { z } from 'zod'
import { generateTopic } from '../services/geminiClient'

const router = Router()

const FALLBACK: Record<string, { prompt: string; topicName: string }> = {
  thesis: {
    prompt: 'Some people think governments should spend money on railways rather than roads. Discuss both views and give your opinion.',
    topicName: 'Railways vs Roads',
  },
  paragraph: {
    prompt: 'Many believe online education is replacing traditional classrooms. To what extent do you agree or disagree?',
    topicName: 'Online Education',
  },
  miniEssay: {
    prompt: 'In many countries, young people are moving to cities. What are the causes and effects?',
    topicName: 'Youth Migration to Cities',
  },
}

const bodySchema = z.object({
  mode: z.enum(['thesis', 'paragraph', 'miniEssay']),
})

router.post('/', async (req, res) => {
  const parsed = bodySchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid mode' })
    return
  }
  const { mode } = parsed.data
  try {
    const topic = await generateTopic(mode)
    res.json(topic)
  } catch (error) {
    console.warn('Topic generation failed, using fallback:', error)
    res.json(FALLBACK[mode])
  }
})

export { router as topicRouter }
