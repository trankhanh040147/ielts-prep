import { describe, it, expect } from 'vitest'
import { wordDiff } from '../lib/wordDiff'

describe('wordDiff', () => {
  it('returns all unchanged tokens for identical strings', () => {
    const tokens = wordDiff('hello world', 'hello world')
    expect(tokens.every((t) => t.type === 'unchanged')).toBe(true)
    expect(tokens.map((t) => t.text).join('')).toBe('hello world')
  })

  it('marks swapped word as removed + added', () => {
    const tokens = wordDiff('governments should invest', 'authorities should invest')
    const removed = tokens.filter((t) => t.type === 'removed')
    const added = tokens.filter((t) => t.type === 'added')
    expect(removed.map((t) => t.text).join('')).toContain('governments')
    expect(added.map((t) => t.text).join('')).toContain('authorities')
  })

  it('marks inserted word as added', () => {
    const tokens = wordDiff('take action', 'take decisive action')
    const added = tokens.filter((t) => t.type === 'added')
    expect(added.map((t) => t.text).join('')).toContain('decisive')
  })

  it('marks deleted word as removed', () => {
    const tokens = wordDiff('take decisive action', 'take action')
    const removed = tokens.filter((t) => t.type === 'removed')
    expect(removed.map((t) => t.text).join('')).toContain('decisive')
  })

  it('reconstructing all token texts reproduces the revised string', () => {
    const original = 'The government should taking action.'
    const revised = 'The government should take action.'
    const tokens = wordDiff(original, revised)
    const reconstructed = tokens
      .filter((t) => t.type !== 'removed')
      .map((t) => t.text)
      .join('')
    expect(reconstructed).toBe(revised)
  })
})
