interface PromptCardProps {
  prompt: string
}

export function PromptCard({ prompt }: PromptCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Topic</p>
      <p className="text-slate-800 leading-relaxed">{prompt}</p>
    </div>
  )
}
