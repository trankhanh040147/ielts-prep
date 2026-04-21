import { diffWords } from 'diff'

export type DiffToken = { text: string; type: 'added' | 'removed' | 'unchanged' }

export function wordDiff(original: string, revised: string): DiffToken[] {
  return diffWords(original, revised).map((part) => ({
    text: part.value,
    type: part.added ? 'added' : part.removed ? 'removed' : 'unchanged',
  }))
}
