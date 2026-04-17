import { GoogleGenerativeAI } from '@google/generative-ai'
import type { PracticeMode, FeedbackLevel } from '../types'

const modelName = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash'

type GeminiInput = {
  mode: PracticeMode
  level: FeedbackLevel
  text: string
  prompt: string
}

export async function getGeminiFeedback(input: GeminiInput): Promise<unknown> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY')

  const client = new GoogleGenerativeAI(apiKey)
  const model = client.getGenerativeModel({ model: modelName })

  const sentenceRule =
    input.level === 'sentence'
      ? 'Return ONE feedback object per sentence in the text. The "targetText" field MUST be the exact sentence copied verbatim — not the whole paragraph.'
      : 'Return ONE feedback object covering the whole text. Set "targetText" to the full submitted text.'

  const instruction = [
    'You are an IELTS writing coach. Return strict JSON only — no markdown, no text outside JSON.',
    'Schema: {"feedback":[{"targetText":string,"strengths":[string],"issues":[string],"revision":{"explanation":string,"rewrites":[string]}}]}.',
    '"explanation" must state WHY the writing is weak and WHAT grammatical or rhetorical principle fixes it.',
    '"rewrites" must contain 2–3 concrete alternative sentences that fix the identified issue.',
    sentenceRule,
    `Practice mode: ${input.mode}.`,
    `Topic: ${input.prompt}`,
    `Student text: ${input.text}`,
  ].join('\n')

  const result = await model.generateContent(instruction)
  const text = result.response.text()
  const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    return {}
  }
}
