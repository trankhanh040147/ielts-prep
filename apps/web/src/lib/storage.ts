import type { FeedbackUnit, PracticeRecord } from '../types';

export const STORAGE_KEY = 'ieltsPrep.v0.1.history';

const newestFirst = (left: PracticeRecord, right: PracticeRecord) => {
  return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
};

const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
};

const isFeedbackUnit = (value: unknown): value is FeedbackUnit => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const unit = value as Partial<FeedbackUnit>;
  return (
    (unit.level === 'sentence' || unit.level === 'paragraph') &&
    typeof unit.targetText === 'string' &&
    isStringArray(unit.strengths) &&
    isStringArray(unit.issues) &&
    typeof unit.revisionHint === 'string'
  );
};

const isPracticeRecord = (value: unknown): value is PracticeRecord => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Partial<PracticeRecord>;
  return (
    typeof record.id === 'string' &&
    typeof record.mode === 'string' &&
    typeof record.prompt === 'string' &&
    typeof record.draft === 'string' &&
    Array.isArray(record.feedback) &&
    record.feedback.every(isFeedbackUnit) &&
    typeof record.updatedAt === 'string'
  );
};

export function loadHistory(): PracticeRecord[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isPracticeRecord).sort(newestFirst);
  } catch {
    return [];
  }
}

export function savePractice(record: PracticeRecord): PracticeRecord[] {
  if (!record.draft.trim()) {
    throw new Error('Writing text is required');
  }

  const existing = loadHistory().filter((item) => item.id !== record.id);
  const next = [...existing, record].sort(newestFirst);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
