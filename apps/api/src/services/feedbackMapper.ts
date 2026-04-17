import type { FeedbackLevel, FeedbackUnit } from '../types'

const PARSE_FAILURE_REVISION = {
  explanation: 'Could not parse provider response.',
  rewrites: [] as string[],
}

export function mapGeminiToFeedback(raw: unknown, level: FeedbackLevel, fallbackText: string): FeedbackUnit[] {
  const items = (raw as { feedback?: unknown[] })?.feedback

  if (!Array.isArray(items)) {
    return [
      {
        level,
        targetText: fallbackText,
        strengths: ['You addressed the prompt directly.'],
        issues: ['Could not parse provider response.'],
        revision: PARSE_FAILURE_REVISION,
      },
    ]
  }

  if (items.length === 0) return []

  return items.map((item) => {
    const x = item as {
      targetText?: unknown
      strengths?: unknown
      issues?: unknown
      revision?: { explanation?: unknown; rewrites?: unknown }
    }

    const explanation =
      typeof x.revision?.explanation === 'string'
        ? x.revision.explanation
        : 'Revise for clearer logic and grammar.'

    const rewrites = Array.isArray(x.revision?.rewrites)
      ? (x.revision!.rewrites as unknown[]).filter((v): v is string => typeof v === 'string')
      : []

    return {
      level,
      targetText: typeof x.targetText === 'string' ? x.targetText : fallbackText,
      strengths: Array.isArray(x.strengths)
        ? x.strengths.filter((v): v is string => typeof v === 'string')
        : [],
      issues: Array.isArray(x.issues)
        ? x.issues.filter((v): v is string => typeof v === 'string')
        : [],
      revision: { explanation, rewrites },
    }
  })
}
