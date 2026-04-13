export async function requestFeedback(body: {
  mode: 'thesis' | 'paragraph' | 'miniEssay'
  level: 'sentence' | 'paragraph'
  text: string
  prompt: string
}) {
  const res = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}
