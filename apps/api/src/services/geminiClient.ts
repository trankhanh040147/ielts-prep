import { GoogleGenerativeAI } from '@google/generative-ai'

const modelName = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash'

type GeminiInput = {
  mode: 'thesis' | 'paragraph' | 'miniEssay'
  level: 'sentence' | 'paragraph'
  text: string
  prompt: string
}

export async function getGeminiFeedback(input: GeminiInput): Promise<unknown> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY')
  }

  const client = new GoogleGenerativeAI(apiKey)
  const model = client.getGenerativeModel({ model: modelName })

  const instruction = [
    'Return strict JSON only.',
    'Schema: {"feedback":[{"strengths":[string],"issues":[string],"revisionHint":string}]}.',
    `Mode: ${input.mode}.`,
    `Level: ${input.level}.`,
    `Prompt: ${input.prompt}.`,
    `Text: ${input.text}.`,
  ].join(' ')

  const result = await model.generateContent(instruction)
  const text = result.response.text()
  return JSON.parse(text)
}
