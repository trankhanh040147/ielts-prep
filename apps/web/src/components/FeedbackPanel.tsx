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
          <p className="italic text-slate-600 border-l-2 border-slate-300 pl-3 mb-3 text-sm">
            {unit.targetText}
          </p>

          {unit.strengths.length > 0 && (
            <>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Strengths</p>
              <ul className="list-disc pl-4 text-sm text-emerald-800 space-y-0.5 mb-3">
                {unit.strengths.map((s, j) => <li key={j}>{s}</li>)}
              </ul>
            </>
          )}

          {unit.issues.length > 0 && (
            <>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Issues</p>
              <ul className="list-disc pl-4 text-sm text-amber-800 space-y-0.5 mb-3">
                {unit.issues.map((issue, j) => <li key={j}>{issue}</li>)}
              </ul>
            </>
          )}

          <div className="bg-slate-50 rounded-md p-3 border border-slate-200">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">Revision</p>
            <p className="text-sm text-slate-700 mb-2">{unit.revision.explanation}</p>
            {unit.revision.rewrites.length > 0 && (
              <>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                  Alternative Rewrites
                </p>
                <ul className="space-y-1.5">
                  {unit.revision.rewrites.map((r, j) => (
                    <li key={j} className="text-sm italic text-indigo-800 bg-indigo-50 rounded px-2.5 py-1.5">
                      ✏ {r}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
