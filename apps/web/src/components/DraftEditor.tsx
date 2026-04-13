interface DraftEditorProps {
  draft: string
  onChange: (value: string) => void
}

export function DraftEditor({ draft, onChange }: DraftEditorProps) {
  return (
    <textarea
      aria-label="Writing draft"
      value={draft}
      onChange={(e) => onChange(e.target.value)}
      rows={10}
      cols={60}
    />
  )
}
