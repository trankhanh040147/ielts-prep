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

  const prompt = PROMPT_BANK[mode][0]

  async function handleCheckSentence() {
    const result = await requestFeedback({ mode, level: 'sentence', text: draft, prompt })
    setFeedback(result.feedback ?? [])
  }

  return (
    <div>
      <ModePicker mode={mode} onModeChange={setMode} />
      <PromptCard prompt={prompt} />
      <DraftEditor draft={draft} onChange={setDraft} />
      <button onClick={handleCheckSentence}>Check Sentence</button>
      <FeedbackPanel feedback={feedback} />
      <SavePracticeButton />
      <HistoryList />
    </div>
  )
}
