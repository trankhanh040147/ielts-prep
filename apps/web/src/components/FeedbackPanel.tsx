import type { FeedbackUnit } from '../types'

interface FeedbackPanelProps {
  feedback: FeedbackUnit[]
}

export function FeedbackPanel({ feedback }: FeedbackPanelProps) {
  if (feedback.length === 0) return null

  return (
    <div>
      {feedback.map((unit, i) => (
        <div key={i}>
          <p>{unit.targetText}</p>
          <ul>
            {unit.strengths.map((s, j) => (
              <li key={j}>{s}</li>
            ))}
          </ul>
          <ul>
            {unit.issues.map((issue, j) => (
              <li key={j}>{issue}</li>
            ))}
          </ul>
          <p>{unit.revisionHint}</p>
        </div>
      ))}
    </div>
  )
}
