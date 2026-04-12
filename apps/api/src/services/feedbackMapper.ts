import type { FeedbackLevel, FeedbackUnit } from '../types';

const createFallbackUnit = (
  level: FeedbackLevel,
  targetText: string
): FeedbackUnit => ({
  level,
  targetText,
  strengths: [],
  issues: [],
  revisionHint: ''
});

const fallbackFeedback = (
  level: FeedbackLevel,
  targetText: string
): FeedbackUnit[] => [
  createFallbackUnit(level, targetText)
];

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
};

export const mapGeminiToFeedback = (
  raw: unknown,
  level: FeedbackLevel,
  targetText: string
): FeedbackUnit[] => {
  if (!isObjectRecord(raw) || !Array.isArray(raw.feedback)) {
    return fallbackFeedback(level, targetText);
  }

  if (raw.feedback.length === 0) {
    return fallbackFeedback(level, targetText);
  }

  return raw.feedback.map((item): FeedbackUnit => {
    if (!isObjectRecord(item)) {
      return createFallbackUnit(level, targetText);
    }

    return {
      level,
      targetText: typeof item.targetText === 'string' ? item.targetText : targetText,
      strengths: toStringArray(item.strengths),
      issues: toStringArray(item.issues),
      revisionHint: typeof item.revisionHint === 'string' ? item.revisionHint : ''
    };
  });
};
