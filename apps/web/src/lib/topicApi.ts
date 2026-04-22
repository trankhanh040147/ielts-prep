import type { PracticeMode, TopicResponse } from '../types'

export async function generateTopic(mode: PracticeMode): Promise<TopicResponse> {
  const res = await fetch('/api/topic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode }),
  })
  if (!res.ok) {
    throw new Error(`Topic API error: ${res.status}`)
  }
  return res.json() as Promise<TopicResponse>
}
