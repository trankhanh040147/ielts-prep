import { useState } from 'react'
import type { PracticeMode, FeedbackLevel, FeedbackUnit, PracticeRecord } from './types'
import { requestFeedback } from './lib/api'
import { PROMPT_BANK } from './lib/promptBank'
import { loadHistory } from './lib/storage'
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
  const [history, setHistory] = useState<PracticeRecord[]>(() => loadHistory())
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID())

  const prompt = PROMPT_BANK[mode][0]

  function handleModeChange(newMode: PracticeMode) {
    setMode(newMode)
    setDraft('')
    setFeedback([])
    setFeedbackError(null)
    setSessionId(crypto.randomUUID())
  }

  async function handleCheck(level: FeedbackLevel) {
    setLoading(true)
    setFeedbackError(null)
    try {
      const result = await requestFeedback({ mode, level, text: draft, prompt })
      setFeedback(result.feedback ?? [])
    } catch {
      setFeedbackError('Feedback service unavailable. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleSaved(newHistory: PracticeRecord[]) {
    setHistory(newHistory)
  }

  function handleSelectRecord(record: PracticeRecord) {
    setMode(record.mode)
    setDraft(record.draft)
    setFeedback(record.feedback)
    setFeedbackError(null)
  }

  return (
    <div>
      <ModePicker mode={mode} onModeChange={handleModeChange} />
      <PromptCard prompt={prompt} />
      <DraftEditor draft={draft} onChange={setDraft} />
      <button onClick={() => handleCheck('sentence')} disabled={loading}>
        {loading ? 'Checking...' : 'Check Sentence'}
      </button>
      <button onClick={() => handleCheck('paragraph')} disabled={loading}>
        {loading ? 'Checking...' : 'Check Paragraph'}
      </button>
      {feedbackError && <p role="alert">{feedbackError}</p>}
      <FeedbackPanel feedback={feedback} />
      <SavePracticeButton
        draft={draft}
        mode={mode}
        prompt={prompt}
        feedback={feedback}
        sessionId={sessionId}
        onSaved={handleSaved}
      />
      <HistoryList history={history} onSelect={handleSelectRecord} />
    </div>
  )
}
