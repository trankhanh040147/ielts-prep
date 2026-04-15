import type { PracticeRecord } from '../types'

interface HistoryListProps {
  history: PracticeRecord[]
  onSelect: (record: PracticeRecord) => void
}

export function HistoryList({ history, onSelect }: HistoryListProps) {
  if (history.length === 0) return null

  return (
    <div>
      <h2 className="text-base font-semibold text-slate-900 mb-3 mt-6">History</h2>
      <ul className="space-y-1">
        {history.map((record) => (
          <li key={record.id} className="border-b border-slate-100 last:border-0">
            <button
              onClick={() => onSelect(record)}
              className="w-full text-left py-2.5 flex items-center gap-3 hover:text-indigo-600 transition-colors"
            >
              <span className="text-xs text-slate-500 shrink-0">
                {new Date(record.updatedAt).toLocaleString()} —
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 shrink-0">
                {record.mode === 'thesis' ? 'Thesis' : record.mode === 'paragraph' ? 'Paragraph' : 'Mini Essay'}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
