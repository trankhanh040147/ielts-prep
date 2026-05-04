import type { BandEstimate } from '../types'

interface BandEstimatePanelProps {
  bandEstimate?: BandEstimate
}

const criteria = [
  ['Task Achievement', 'taskAchievement'],
  ['Coherence & Cohesion', 'coherenceCohesion'],
  ['Lexical Resource', 'lexicalResource'],
  ['Grammar Range & Accuracy', 'grammaticalRangeAccuracy'],
] as const

export function BandEstimatePanel({ bandEstimate }: BandEstimatePanelProps) {
  if (!bandEstimate) return null

  return (
    <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4 shadow-sm mb-3">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Overall</p>
        <p className="text-2xl font-bold text-indigo-900">{bandEstimate.overall}</p>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        {criteria.map(([label, key]) => (
          <div key={key} className="flex items-center justify-between rounded-md bg-white/70 px-3 py-2 text-sm">
            <dt className="text-slate-600">{label}</dt>
            <dd className="font-semibold text-slate-900">{bandEstimate[key]}</dd>
          </div>
        ))}
      </dl>
      <p className="text-sm text-slate-700">{bandEstimate.summary}</p>
    </div>
  )
}
