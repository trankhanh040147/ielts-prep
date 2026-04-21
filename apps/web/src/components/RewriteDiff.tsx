import { useState } from 'react'
import { wordDiff } from '../lib/wordDiff'

interface RewriteDiffProps {
  targetText: string
  rewrites: string[]
  draft: string
}

function extractContext(draft: string, targetText: string): { before: string; after: string } {
  const pos = draft.indexOf(targetText)
  if (pos === -1) return { before: '', after: '' }

  const beforeChunk = draft.slice(0, pos).trim()
  const prevDot = beforeChunk.lastIndexOf('. ', beforeChunk.length - 2)
  const before = prevDot === -1 ? beforeChunk : beforeChunk.slice(prevDot + 2).trim()

  const afterChunk = draft.slice(pos + targetText.length)
  const nextDot = afterChunk.indexOf('. ')
  const after = nextDot === -1 ? afterChunk.trim() : afterChunk.slice(0, nextDot + 1).trim()

  return { before, after }
}

export function RewriteDiff({ targetText, rewrites, draft }: RewriteDiffProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (rewrites.length === 0) return null

  const { before, after } = extractContext(draft, targetText)
  const tokens = wordDiff(targetText, rewrites[activeIndex])

  return (
    <div>
      <div className="flex gap-1 mb-2">
        {rewrites.map((_, i) => (
          <button
            type="button"
            key={i}
            onClick={() => setActiveIndex(i)}
            aria-pressed={activeIndex === i}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
              activeIndex === i
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <p className="text-sm leading-relaxed">
        {before && <span className="text-slate-400">{before} </span>}
        {tokens.map((token, i) => {
          if (token.type === 'removed') {
            return (
              <del key={i} className="bg-red-100 text-red-700 line-through">
                {token.text}
              </del>
            )
          }
          if (token.type === 'added') {
            return (
              <ins key={i} className="bg-green-100 text-green-700 no-underline">
                {token.text}
              </ins>
            )
          }
          return <span key={i}>{token.text}</span>
        })}
        {after && <span className="text-slate-400"> {after}</span>}
      </p>
    </div>
  )
}
