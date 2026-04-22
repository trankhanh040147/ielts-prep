import { useState } from 'react'
import type { PracticeMode, FeedbackUnit, PracticeRecord } from '../types'
import { savePractice } from '../lib/storage'

interface SavePracticeButtonProps {
  draft: string
  mode: PracticeMode
  prompt: string
  topicName: string
  feedback: FeedbackUnit[]
  sessionId: string
  onSaved: (history: PracticeRecord[]) => void
}

export function SavePracticeButton({ draft, mode, prompt, topicName, feedback, sessionId, onSaved }: SavePracticeButtonProps) {
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    setError(null)
    try {
      const history = savePractice({
        id: sessionId,
        mode,
        prompt,
        topicName,
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
    <div className="mt-4">
      <button
        onClick={handleSave}
        className="w-full sm:w-auto px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
      >
        Save Practice
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
