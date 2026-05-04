interface DraftEditorProps {
  draft: string
  onChange: (value: string) => void
}

function countWords(text: string): number {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

export function DraftEditor({ draft, onChange }: DraftEditorProps) {
  const wordCount = countWords(draft)
  const wordLabel = wordCount === 1 ? 'word' : 'words'

  return (
    <div>
      <label htmlFor="draft" className="block text-sm font-medium text-slate-700 mb-1">
        Your draft
      </label>
      <textarea
        id="draft"
        aria-label="Writing draft"
        value={draft}
        onChange={(e) => onChange(e.target.value)}
        rows={12}
        className="w-full rounded-lg border border-slate-200 p-3 text-slate-900 leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
      <p className="mt-1 text-xs text-slate-500">{wordCount} {wordLabel}</p>
    </div>
  )
}
