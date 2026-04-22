import { useState } from 'react'
import type { PracticeMode } from '../types'
import { PROMPT_BANK } from '../lib/promptBank'
import { generateTopic } from '../lib/topicApi'

interface TopicPickerProps {
  mode: PracticeMode
  prompt: string
  topicName: string
  onTopicChange: (prompt: string, topicName: string) => void
}

export function TopicPicker({ mode, prompt, topicName, onTopicChange }: TopicPickerProps) {
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

  async function handleGenerate() {
    setGenerating(true)
    setGenerateError(null)
    try {
      const result = await generateTopic(mode)
      onTopicChange(result.prompt, result.topicName)
    } catch {
      setGenerateError("Couldn't generate topic. Try again.")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">Topic</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {PROMPT_BANK[mode].map((entry) => (
          <button
            key={entry.topicName}
            type="button"
            onClick={() => onTopicChange(entry.prompt, entry.topicName)}
            aria-pressed={topicName === entry.topicName}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              topicName === entry.topicName
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {entry.topicName}
          </button>
        ))}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="rounded-full px-3 py-1 text-xs font-medium border border-dashed border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-50 transition-colors"
        >
          {generating ? 'Generating…' : '✨ Generate new…'}
        </button>
      </div>
      {generateError && (
        <p role="alert" className="text-xs text-red-600 mb-2">{generateError}</p>
      )}
      <div className="flex items-center gap-2">
        <label htmlFor="topic-name" className="text-xs text-slate-400 whitespace-nowrap">Session name</label>
        <input
          id="topic-name"
          type="text"
          value={topicName}
          onChange={(e) => onTopicChange(prompt, e.target.value)}
          className="flex-1 text-sm border border-slate-200 rounded-md px-2 py-1 text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>
  )
}
