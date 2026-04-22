import type { PracticeRecord } from '../types'

const STORAGE_KEY = 'ieltsPrep.v0.1.history'

function fallbackTopicName(prompt: string): string {
  const words = prompt.split(' ').slice(0, 6)
  const hasMore = prompt.split(' ').length > 6
  return words.join(' ') + (hasMore ? '…' : '')
}

export function loadHistory(): PracticeRecord[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return (parsed as PracticeRecord[])
      .map((r) => ({
        ...r,
        topicName: r.topicName ?? fallbackTopicName(r.prompt),
      }))
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  } catch {
    return []
  }
}

export function savePractice(record: PracticeRecord): PracticeRecord[] {
  if (!record.draft.trim()) {
    throw new Error('Writing text is required')
  }
  const next = [record, ...loadHistory().filter((x) => x.id !== record.id)].sort((a, b) =>
    a.updatedAt < b.updatedAt ? 1 : -1,
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export function renameRecord(id: string, newName: string): PracticeRecord[] {
  const records = loadHistory()
  const updated = records.map((r) => (r.id === id ? { ...r, topicName: newName } : r))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}
