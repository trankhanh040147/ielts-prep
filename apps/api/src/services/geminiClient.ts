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
      ? 'Return exactly ONE feedback object per sentence in the text. The "targetText" field MUST be the exact sentence copied verbatim — not the whole paragraph. The "feedback" array must have one entry per sentence.'
      : 'Return exactly ONE feedback object in the "feedback" array covering the whole text. Set "targetText" to the full submitted text.'

  const instruction = [
    'You are an IELTS writing coach. Return strict JSON only — no markdown, no text outside JSON.',
    'Schema: {"feedback":[{"targetText":string,"strengths":[string],"issues":[string],"revision":{"explanation":string,"rewrites":[string]}}],"bandEstimate":{"overall":number,"taskAchievement":number,"coherenceCohesion":number,"lexicalResource":number,"grammaticalRangeAccuracy":number,"summary":string}}.',
    '"explanation" must state WHY the writing is weak and WHAT grammatical or rhetorical principle fixes it.',
    '"rewrites" must contain 2–3 concrete alternative sentences that fix the identified issue.',
    'Also estimate IELTS Writing Task 2 band scores from 0 to 9 using half-band increments for Task Achievement, Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy.',
    'The bandEstimate.summary must briefly explain the score in one sentence.',
    sentenceRule,
    `Practice mode: ${input.mode}.`,
    `Topic: ${input.prompt}`,
    `Student text: ${input.text}`,
  ].join('\n')

  const result = await model.generateContent(instruction)
  const text = result.response.text()
  const cleaned = text.trimStart().replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    return {}
  }
}

export async function generateTopic(mode: PracticeMode): Promise<{ prompt: string; topicName: string }> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY')

  const client = new GoogleGenerativeAI(apiKey)
  const model = client.getGenerativeModel({ model: modelName })

  const geminiPrompt = `Generate one IELTS Academic Writing Task 2 question for the practice mode: "${mode}".
Respond with JSON only, no explanation: { "prompt": "<full question>", "topicName": "<max 5 words>" }
The topicName should be a short label suitable for a history list entry.`

  const result = await model.generateContent(geminiPrompt)
  const text = result.response.text()
  const jsonText = text.trimStart().replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    throw new Error('generateTopic: invalid JSON from Gemini')
  }

  const p = parsed as Record<string, unknown>
  if (typeof p.prompt !== 'string' || typeof p.topicName !== 'string') {
    throw new Error('generateTopic: unexpected response shape')
  }
  return { prompt: p.prompt, topicName: p.topicName }
}
