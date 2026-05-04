import type { BandEstimate, FeedbackLevel, FeedbackUnit } from '../types'

const DEFAULT_BAND_SUMMARY = 'Estimated IELTS band based on this draft.'

export function mapGeminiToFeedback(raw: unknown, level: FeedbackLevel, fallbackText: string): FeedbackUnit[] {
  const items = (raw as { feedback?: unknown[] })?.feedback

  if (!Array.isArray(items)) {
    return [
      {
        level,
        targetText: fallbackText,
        strengths: ['You addressed the prompt directly.'],
        issues: ['Could not parse provider response.'],
        revision: { explanation: 'Could not parse provider response.', rewrites: [] },
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

function parseBandScore(value: unknown): number | undefined {
  const numeric = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN
  if (!Number.isFinite(numeric)) return undefined
  const rounded = Math.round(numeric * 2) / 2
  return Math.min(9, Math.max(0, rounded))
}

export function mapGeminiToBandEstimate(raw: unknown): BandEstimate | undefined {
  const estimate = (raw as { bandEstimate?: unknown })?.bandEstimate
  if (!estimate || typeof estimate !== 'object') return undefined

  const source = estimate as Record<string, unknown>
  const overall = parseBandScore(source.overall)
  const taskAchievement = parseBandScore(source.taskAchievement)
  const coherenceCohesion = parseBandScore(source.coherenceCohesion)
  const lexicalResource = parseBandScore(source.lexicalResource)
  const grammaticalRangeAccuracy = parseBandScore(source.grammaticalRangeAccuracy)

  if (
    overall === undefined ||
    taskAchievement === undefined ||
    coherenceCohesion === undefined ||
    lexicalResource === undefined ||
    grammaticalRangeAccuracy === undefined
  ) {
    return undefined
  }

  const summary = typeof source.summary === 'string' && source.summary.trim() ? source.summary.trim() : DEFAULT_BAND_SUMMARY

  return {
    overall,
    taskAchievement,
    coherenceCohesion,
    lexicalResource,
    grammaticalRangeAccuracy,
    summary,
  }
}
