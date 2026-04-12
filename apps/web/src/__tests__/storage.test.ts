import { beforeEach, describe, expect, test } from 'vitest';

import { loadHistory, savePractice } from '../lib/storage';
import type { PracticeRecord } from '../types';

describe('storage', () => {
  beforeEach(() => {
    window.localStorage.removeItem('ieltsPrep.v0.1.history');
  });

  test('rejects saving when draft is empty', () => {
    const record: PracticeRecord = {
      id: 'record-1',
      mode: 'thesis',
      prompt: 'State your opinion clearly in one sentence.',
      draft: '   ',
      feedback: [],
      updatedAt: '2026-01-01T00:00:00.000Z'
    };

    expect(() => savePractice(record)).toThrowError('Writing text is required');
  });

  test('loads records newest-first by updatedAt', () => {
    savePractice({
      id: 'record-1',
      mode: 'thesis',
      prompt: 'State your opinion clearly in one sentence.',
      draft: 'Older draft',
      feedback: [],
      updatedAt: '2026-01-01T00:00:00.000Z'
    });

    savePractice({
      id: 'record-2',
      mode: 'paragraph',
      prompt: 'Write one focused body paragraph with a clear topic sentence.',
      draft: 'Newest draft',
      feedback: [],
      updatedAt: '2026-01-02T00:00:00.000Z'
    });

    const history = loadHistory();
    expect(history.map((item) => item.id)).toEqual(['record-2', 'record-1']);
  });

  test('filters malformed persisted feedback records', () => {
    window.localStorage.setItem(
      'ieltsPrep.v0.1.history',
      JSON.stringify([
        {
          id: 'record-valid',
          mode: 'thesis',
          prompt: 'Summarize your position in one sentence.',
          draft: 'A clear position statement.',
          feedback: [
            {
              level: 'sentence',
              targetText: 'A clear position statement.',
              strengths: ['Specific claim'],
              issues: ['Could be more concise'],
              revisionHint: 'Reduce redundancy in the sentence.'
            }
          ],
          updatedAt: '2026-01-03T00:00:00.000Z'
        },
        {
          id: 'record-invalid-feedback',
          mode: 'paragraph',
          prompt: 'Write one focused body paragraph with evidence.',
          draft: 'This draft has malformed feedback payload.',
          feedback: [
            {
              level: 'sentence',
              targetText: 'This draft has malformed feedback payload.',
              strengths: ['Has a topic sentence'],
              issues: 'Missing array shape',
              revisionHint: 'Convert issues to an array.'
            }
          ],
          updatedAt: '2026-01-04T00:00:00.000Z'
        }
      ])
    );

    const history = loadHistory();

    expect(history).toHaveLength(1);
    expect(history[0]?.id).toBe('record-valid');
  });
});
