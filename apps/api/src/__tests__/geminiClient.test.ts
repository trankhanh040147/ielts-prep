import { describe, expect, it } from 'vitest';

import { parseGeminiFeedbackText } from '../services/geminiClient';

describe('parseGeminiFeedbackText', () => {
  it('parses raw JSON text', () => {
    const result = parseGeminiFeedbackText('{"feedback":[{"targetText":"x"}]}');

    expect(result).toEqual({
      feedback: [{ targetText: 'x' }]
    });
  });

  it('parses fenced JSON text', () => {
    const result = parseGeminiFeedbackText('```json\n{"feedback":[{"targetText":"x"}]}\n```');

    expect(result).toEqual({
      feedback: [{ targetText: 'x' }]
    });
  });

  it('skips parseable non-feedback JSON and returns later valid feedback JSON', () => {
    const result = parseGeminiFeedbackText(
      '{"status":"ok"}\n{"feedback":[{"targetText":"x"}]}'
    );

    expect(result).toEqual({
      feedback: [{ targetText: 'x' }]
    });
  });

  it('parses fenced JSON with extra prose around it', () => {
    const result = parseGeminiFeedbackText(
      'Here is the response:\n```json\n{"feedback":[{"targetText":"x"}]}\n```\nDone.'
    );

    expect(result).toEqual({
      feedback: [{ targetText: 'x' }]
    });
  });

  it('chooses the only candidate with a valid feedback array', () => {
    const result = parseGeminiFeedbackText(
      '{"feedback":"not-array"}\n```json\n{"feedback":[{"targetText":"x"}]}\n```\n{"foo":1}'
    );

    expect(result).toEqual({
      feedback: [{ targetText: 'x' }]
    });
  });

  it('falls back for invalid JSON text', () => {
    const result = parseGeminiFeedbackText('{"feedback": [}');

    expect(result).toEqual({ feedback: [] });
  });

  it('falls back for empty text', () => {
    const result = parseGeminiFeedbackText('   ');

    expect(result).toEqual({ feedback: [] });
  });
});
