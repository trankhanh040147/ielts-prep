import { useState } from 'react'
import type { PracticeMode, FeedbackLevel, FeedbackUnit, PracticeRecord } from './types'
import { requestFeedback } from './lib/api'
import { PROMPT_BANK } from './lib/promptBank'
import { loadHistory, renameRecord } from './lib/storage'
import { ModePicker } from './components/ModePicker'
import { TopicPicker } from './components/TopicPicker'
import { PromptCard } from './components/PromptCard'
import { DraftEditor } from './components/DraftEditor'
import { FeedbackPanel } from './components/FeedbackPanel'
import { SavePracticeButton } from './components/SavePracticeButton'
import { HistoryList } from './components/HistoryList'

export default function App() {
  const [mode, setMode] = useState<PracticeMode>('thesis')
  const [prompt, setPrompt] = useState(PROMPT_BANK['thesis'][0].prompt)
  const [topicName, setTopicName] = useState(PROMPT_BANK['thesis'][0].topicName)
  const [draft, setDraft] = useState('')
  const [feedback, setFeedback] = useState<FeedbackUnit[]>([])
  const [loading, setLoading] = useState(false)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)
  const [history, setHistory] = useState<PracticeRecord[]>(() => loadHistory())
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID())

  function handleTopicChange(newPrompt: string, newTopicName: string) {
    setPrompt(newPrompt)
    setTopicName(newTopicName)
  }

  function handleModeChange(newMode: PracticeMode) {
    setMode(newMode)
    setPrompt(PROMPT_BANK[newMode][0].prompt)
    setTopicName(PROMPT_BANK[newMode][0].topicName)
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
    setPrompt(record.prompt)
    setTopicName(record.topicName)
    setDraft(record.draft)
    setFeedback(record.feedback)
    setFeedbackError(null)
  }

  function handleRenameRecord(id: string, newName: string) {
    setHistory(renameRecord(id, newName))
  }

  function handleDeleteRecord(id: string) {
    setHistory((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">IELTS Writing Prep</h1>
        <main className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6">
          <div>
            <ModePicker mode={mode} onModeChange={handleModeChange} />
            <div className="mt-6">
              <TopicPicker
                mode={mode}
                prompt={prompt}
                topicName={topicName}
                onTopicChange={handleTopicChange}
              />
            </div>
            <div className="mt-4">
              <PromptCard prompt={prompt} />
            </div>
            <div className="mt-6">
              <DraftEditor draft={draft} onChange={setDraft} />
            </div>
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => handleCheck('sentence')}
                disabled={loading}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Checking...' : 'Check Sentence'}
              </button>
              <button
                onClick={() => handleCheck('paragraph')}
                disabled={loading}
                className="px-4 py-2 rounded-md bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:border-indigo-300 hover:text-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Checking...' : 'Check Paragraph'}
              </button>
            </div>
            {feedbackError && (
              <p role="alert" className="mt-3 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {feedbackError}
              </p>
            )}
            <SavePracticeButton
              draft={draft}
              mode={mode}
              prompt={prompt}
              topicName={topicName}
              feedback={feedback}
              sessionId={sessionId}
              onSaved={handleSaved}
            />
          </div>

          <div>
            <div className="sticky top-6">
              <FeedbackPanel feedback={feedback} draft={draft} />
              <HistoryList
                history={history}
                onSelect={handleSelectRecord}
                onRename={handleRenameRecord}
                onDelete={handleDeleteRecord}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
