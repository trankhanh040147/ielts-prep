import type { FeedbackRequest, FeedbackResponse, FeedbackUnit } from '../types';

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isFeedbackUnit(value: unknown): value is FeedbackUnit {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<FeedbackUnit>;

  return (
    (candidate.level === 'sentence' || candidate.level === 'paragraph') &&
    typeof candidate.targetText === 'string' &&
    isStringArray(candidate.strengths) &&
    isStringArray(candidate.issues) &&
    typeof candidate.revisionHint === 'string'
  );
}

export async function postFeedback(request: FeedbackRequest): Promise<FeedbackUnit[]> {
  const response = await fetch('/api/feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error('Failed to fetch feedback');
  }

  const data: unknown = await response.json();

  if (!data || typeof data !== 'object' || !('feedback' in data)) {
    throw new Error('Malformed feedback payload: missing feedback object');
  }

  const feedback = (data as FeedbackResponse).feedback;

  if (!Array.isArray(feedback) || !feedback.every(isFeedbackUnit)) {
    throw new Error('Malformed feedback payload: invalid feedback shape');
  }

  return feedback;
}
