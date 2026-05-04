import { useState } from 'react'
import type { PracticeRecord } from '../types'

interface HistoryListProps {
  history: PracticeRecord[]
  onSelect: (record: PracticeRecord) => void
  onRename: (id: string, newName: string) => void
  onDelete: (id: string) => void
}

function countWords(text: string): number {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

function wordCountLabel(text: string): string {
  const count = countWords(text)
  return `${count} ${count === 1 ? 'word' : 'words'}`
}

function attemptLabels(history: PracticeRecord[]): Map<string, number> {
  const groups = new Map<string, PracticeRecord[]>()
  for (const record of history) {
    const key = `${record.mode}\n${record.prompt}`
    groups.set(key, [...(groups.get(key) ?? []), record])
  }

  const labels = new Map<string, number>()
  for (const records of groups.values()) {
    records
      .slice()
      .sort((a, b) => (a.updatedAt > b.updatedAt ? 1 : -1))
      .forEach((record, index) => labels.set(record.id, index + 1))
  }
  return labels
}

export function HistoryList({ history, onSelect, onRename, onDelete }: HistoryListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')

  if (history.length === 0) return null

  function startEdit(record: PracticeRecord) {
    setEditingId(record.id)
    setEditingValue(record.topicName)
  }

  function commitEdit(id: string) {
    const trimmed = editingValue.trim()
    if (trimmed) onRename(id, trimmed)
    setEditingId(null)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  const modeLabel = (mode: PracticeRecord['mode']) =>
    mode === 'thesis' ? 'Thesis' : mode === 'paragraph' ? 'Paragraph' : 'Mini Essay'

  const attempts = attemptLabels(history)

  return (
    <div>
      <h2 className="text-base font-semibold text-slate-900 mb-3 mt-6">History</h2>
      <ul className="space-y-1">
        {history.map((record) => (
          <li key={record.id} className="border-b border-slate-100 last:border-0">
            <div className="py-2.5 flex items-start gap-3">
              <button
                type="button"
                onClick={() => onSelect(record)}
                className="shrink-0 mt-0.5"
              >
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                  {modeLabel(record.mode)}
                </span>
              </button>
              <div className="flex-1 min-w-0">
                {editingId === record.id ? (
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={() => commitEdit(record.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEdit(record.id)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    autoFocus
                    className="w-full text-sm border border-indigo-400 rounded px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={() => startEdit(record)}
                    onKeyDown={(e) => e.key === 'Enter' && startEdit(record)}
                    className="block text-sm text-slate-700 cursor-text hover:text-indigo-600 transition-colors"
                  >
                    {record.topicName}
                  </span>
                )}
                <div className="flex flex-wrap gap-2 text-xs text-slate-400 mt-1">
                  <span>Attempt {attempts.get(record.id) ?? 1}</span>
                  <span>{wordCountLabel(record.draft)}</span>
                  {record.bandEstimate && <span>Band {record.bandEstimate.overall}</span>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onDelete(record.id)}
                aria-label="Delete"
                className="shrink-0 text-slate-300 hover:text-red-500 transition-colors text-sm px-1 mt-0.5"
              >
                ×
              </button>
              <span className="text-xs text-slate-400 shrink-0 mt-1">
                {new Date(record.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
