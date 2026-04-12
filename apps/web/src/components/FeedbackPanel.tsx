import type { FeedbackUnit } from '../types';

type FeedbackPanelProps = {
  feedback: FeedbackUnit[] | null;
  loading: boolean;
  error: string | null;
};

export function FeedbackPanel({ feedback, loading, error }: FeedbackPanelProps) {
  return (
    <section>
      <h2>Feedback</h2>
      {loading ? <p>Loading feedback...</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {feedback
        ? feedback.map((unit, index) => (
            <article key={`${unit.level}-${unit.targetText}-${index}`}>
              <h3>{unit.targetText}</h3>
              <h4>Strengths</h4>
              <ul>
                {unit.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <h4>Issues</h4>
              <ul>
                {unit.issues.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <h4>Revision hint</h4>
              <p>{unit.revisionHint}</p>
            </article>
          ))
        : null}
    </section>
  );
}
