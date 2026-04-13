import type { PracticeMode, FeedbackLevel } from '../types'

export async function requestFeedback(body: {
  mode: PracticeMode
  level: FeedbackLevel
  text: string
  prompt: string
}) {
  const res = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`Feedback API error: ${res.status}`)
  }
  return res.json()
}
