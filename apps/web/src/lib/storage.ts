import type { PracticeRecord } from '../types'

const STORAGE_KEY = 'ieltsPrep.v0.1.history'

export function loadHistory(): PracticeRecord[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return (parsed as PracticeRecord[]).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
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
