import { useState } from 'react'
import type { PracticeMode, FeedbackUnit } from './types'
import { requestFeedback } from './lib/api'
import { PROMPT_BANK } from './lib/promptBank'
import { ModePicker } from './components/ModePicker'
import { PromptCard } from './components/PromptCard'
import { DraftEditor } from './components/DraftEditor'
import { FeedbackPanel } from './components/FeedbackPanel'
import { SavePracticeButton } from './components/SavePracticeButton'
import { HistoryList } from './components/HistoryList'

export default function App() {
  const [mode, setMode] = useState<PracticeMode>('thesis')
  const [draft, setDraft] = useState('')
  const [feedback, setFeedback] = useState<FeedbackUnit[]>([])
  const [loading, setLoading] = useState(false)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  const prompt = PROMPT_BANK[mode][0]

  function handleModeChange(newMode: PracticeMode) {
    setMode(newMode)
    setDraft('')
    setFeedback([])
    setFeedbackError(null)
  }

  async function handleCheckSentence() {
    setLoading(true)
    setFeedbackError(null)
    try {
      const result = await requestFeedback({ mode, level: 'sentence', text: draft, prompt })
      setFeedback(result.feedback ?? [])
    } catch {
      setFeedbackError('Feedback service unavailable. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <ModePicker mode={mode} onModeChange={handleModeChange} />
      <PromptCard prompt={prompt} />
      <DraftEditor draft={draft} onChange={setDraft} />
      <button onClick={handleCheckSentence} disabled={loading}>
        {loading ? 'Checking...' : 'Check Sentence'}
      </button>
      {feedbackError && <p role="alert">{feedbackError}</p>}
      <FeedbackPanel feedback={feedback} />
      <SavePracticeButton />
      <HistoryList />
    </div>
  )
}
