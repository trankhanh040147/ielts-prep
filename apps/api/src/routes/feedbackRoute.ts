import { Router } from 'express';
import { z } from 'zod';

import { mapGeminiToFeedback } from '../services/feedbackMapper';
import { getGeminiFeedback } from '../services/geminiClient';

const feedbackRequestSchema = z.object({
  mode: z.enum(['thesis', 'paragraph', 'miniEssay']),
  level: z.enum(['sentence', 'paragraph']),
  text: z.string().trim().min(1).max(5000),
  prompt: z.string().trim().min(1).max(1000)
});

export const feedbackRoute = Router();

feedbackRoute.post('/api/feedback', async (req, res) => {
  const parsed = feedbackRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid feedback request' });
    return;
  }

  const { mode, level, text, prompt } = parsed.data;

  let geminiPayload: unknown;
  try {
    geminiPayload = await getGeminiFeedback({ mode, level, text, prompt });
  } catch {
    res.status(502).json({ error: 'Feedback service unavailable' });
    return;
  }

  try {
    const feedback = mapGeminiToFeedback(geminiPayload, level, text);
    res.status(200).json({ feedback });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});
