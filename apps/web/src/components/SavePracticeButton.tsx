import { useState } from 'react'
import type { PracticeMode, FeedbackUnit, PracticeRecord } from '../types'
import { savePractice } from '../lib/storage'

interface SavePracticeButtonProps {
  draft: string
  mode: PracticeMode
  prompt: string
  feedback: FeedbackUnit[]
  onSaved: (history: PracticeRecord[]) => void
}

export function SavePracticeButton({ draft, mode, prompt, feedback, onSaved }: SavePracticeButtonProps) {
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    setError(null)
    try {
      const history = savePractice({
        id: crypto.randomUUID(),
        mode,
        prompt,
        draft,
        feedback,
        updatedAt: new Date().toISOString(),
      })
      onSaved(history)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to save practice')
      }
    }
  }

  return (
    <div>
      <button onClick={handleSave}>Save Practice</button>
      {error && <p role="alert">{error}</p>}
    </div>
  )
}
