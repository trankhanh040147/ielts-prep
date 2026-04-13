import type { PracticeRecord } from '../types'

interface HistoryListProps {
  history: PracticeRecord[]
  onSelect: (record: PracticeRecord) => void
}

export function HistoryList({ history, onSelect }: HistoryListProps) {
  if (history.length === 0) return null

  return (
    <ul>
      {history.map((record) => (
        <li key={record.id}>
          <button onClick={() => onSelect(record)}>
            {new Date(record.updatedAt).toLocaleString()} — {record.mode}
          </button>
        </li>
      ))}
    </ul>
  )
}
