import { useState } from 'react'
import type { PracticeRecord } from '../types'

interface HistoryListProps {
  history: PracticeRecord[]
  onSelect: (record: PracticeRecord) => void
  onRename: (id: string, newName: string) => void
  onDelete: (id: string) => void
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

  return (
    <div>
      <h2 className="text-base font-semibold text-slate-900 mb-3 mt-6">History</h2>
      <ul className="space-y-1">
        {history.map((record) => (
          <li key={record.id} className="border-b border-slate-100 last:border-0">
            <div className="py-2.5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => onSelect(record)}
                className="shrink-0"
              >
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                  {modeLabel(record.mode)}
                </span>
              </button>
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
                  className="flex-1 text-sm border border-indigo-400 rounded px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={() => startEdit(record)}
                  onKeyDown={(e) => e.key === 'Enter' && startEdit(record)}
                  className="flex-1 text-sm text-slate-700 cursor-text hover:text-indigo-600 transition-colors"
                >
                  {record.topicName}
                </span>
              )}
              <button
                type="button"
                onClick={() => onDelete(record.id)}
                aria-label="Delete"
                className="shrink-0 text-slate-300 hover:text-red-500 transition-colors text-sm px-1"
              >
                ×
              </button>
              <span className="text-xs text-slate-400 shrink-0">
                {new Date(record.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
