import type { FeedbackUnit } from '../types'

interface FeedbackPanelProps {
  feedback: FeedbackUnit[]
}

export function FeedbackPanel({ feedback }: FeedbackPanelProps) {
  if (feedback.length === 0) return null

  return (
    <div>
      <h2 className="text-base font-semibold text-slate-900 mb-3">Feedback</h2>
      {feedback.map((unit, i) => (
        <div key={i} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm mb-3 last:mb-0">
          <p className="font-medium text-slate-800 mb-3">{unit.targetText}</p>

          {unit.strengths.length > 0 && (
            <>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Strengths</p>
              <ul className="list-disc pl-4 text-sm text-emerald-800 space-y-0.5 mb-3">
                {unit.strengths.map((s, j) => (
                  <li key={j}>{s}</li>
                ))}
              </ul>
            </>
          )}

          {unit.issues.length > 0 && (
            <>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Issues</p>
              <ul className="list-disc pl-4 text-sm text-amber-800 space-y-0.5 mb-3">
                {unit.issues.map((issue, j) => (
                  <li key={j}>{issue}</li>
                ))}
              </ul>
            </>
          )}

          <p className="text-sm italic text-slate-600 border-l-2 border-indigo-300 pl-3">
            {unit.revisionHint}
          </p>
        </div>
      ))}
    </div>
  )
}
