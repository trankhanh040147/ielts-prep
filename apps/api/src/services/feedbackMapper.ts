import type { FeedbackLevel, FeedbackUnit } from '../types'

export function mapGeminiToFeedback(raw: unknown, level: FeedbackLevel, targetText: string): FeedbackUnit[] {
  const items = (raw as { feedback?: unknown[] })?.feedback

  if (!Array.isArray(items)) {
    return [
      {
        level,
        targetText,
        strengths: ['You addressed the prompt directly.'],
        issues: ['Could not parse provider response.'],
        revisionHint: 'Revise one sentence for grammar and clarity.',
      },
    ]
  }
  if (items.length === 0) {
    return []
  }

  return items.map((item) => {
    const x = item as {
      strengths?: unknown
      issues?: unknown
      revisionHint?: unknown
    }
    return {
      level,
      targetText,
      strengths: Array.isArray(x.strengths) ? x.strengths.filter((v): v is string => typeof v === 'string') : [],
      issues: Array.isArray(x.issues) ? x.issues.filter((v): v is string => typeof v === 'string') : [],
      revisionHint: typeof x.revisionHint === 'string' ? x.revisionHint : 'Revise for clearer logic and grammar.',
    }
  })
}
