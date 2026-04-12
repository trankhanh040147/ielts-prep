import { describe, expect, it } from 'vitest';

import { mapGeminiToFeedback } from '../services/feedbackMapper';

describe('mapGeminiToFeedback', () => {
  it('maps valid Gemini feedback items and safely coerces missing fields', () => {
    const raw = {
      feedback: [
        {
          targetText: 'Sentence one.',
          strengths: ['Clear topic sentence'],
          issues: ['Missing example'],
          revisionHint: 'Add a concrete supporting example.'
        },
        {
          strengths: 'not-an-array'
        }
      ]
    };

    const result = mapGeminiToFeedback(raw, 'sentence', 'Original response text.');

    expect(result).toEqual([
      {
        level: 'sentence',
        targetText: 'Sentence one.',
        strengths: ['Clear topic sentence'],
        issues: ['Missing example'],
        revisionHint: 'Add a concrete supporting example.'
      },
      {
        level: 'sentence',
        targetText: 'Original response text.',
        strengths: [],
        issues: [],
        revisionHint: ''
      }
    ]);
  });

  it('returns one fallback feedback unit when payload is invalid', () => {
    const result = mapGeminiToFeedback(null, 'paragraph', 'Original paragraph.');

    expect(result).toEqual([
      {
        level: 'paragraph',
        targetText: 'Original paragraph.',
        strengths: [],
        issues: [],
        revisionHint: ''
      }
    ]);
  });

  it('returns one fallback feedback unit when feedback is an empty array', () => {
    const result = mapGeminiToFeedback({ feedback: [] }, 'sentence', 'Original sentence.');

    expect(result).toEqual([
      {
        level: 'sentence',
        targetText: 'Original sentence.',
        strengths: [],
        issues: [],
        revisionHint: ''
      }
    ]);
  });

  it('returns safe fallback units for non-object feedback entries', () => {
    const result = mapGeminiToFeedback({ feedback: [null, 'x'] }, 'paragraph', 'Original paragraph.');

    expect(result).toEqual([
      {
        level: 'paragraph',
        targetText: 'Original paragraph.',
        strengths: [],
        issues: [],
        revisionHint: ''
      },
      {
        level: 'paragraph',
        targetText: 'Original paragraph.',
        strengths: [],
        issues: [],
        revisionHint: ''
      }
    ]);
  });

  it('returns one fallback feedback unit when feedback key is missing', () => {
    const result = mapGeminiToFeedback({}, 'sentence', 'Original response text.');

    expect(result).toEqual([
      {
        level: 'sentence',
        targetText: 'Original response text.',
        strengths: [],
        issues: [],
        revisionHint: ''
      }
    ]);
  });
});
