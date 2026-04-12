import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { app } from '../app';
import { mapGeminiToFeedback } from '../services/feedbackMapper';
import { getGeminiFeedback } from '../services/geminiClient';
import type { FeedbackUnit } from '../types';

vi.mock('../services/geminiClient', () => ({
  getGeminiFeedback: vi.fn()
}));

vi.mock('../services/feedbackMapper', () => ({
  mapGeminiToFeedback: vi.fn()
}));

describe('POST /api/feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns mapped feedback when request is valid', async () => {
    const geminiPayload = { feedback: [{ targetText: 'x' }] };
    const mappedFeedback: FeedbackUnit[] = [
      {
        level: 'paragraph',
        targetText: 'Essay text',
        strengths: ['Coherent argument'],
        issues: ['Needs examples'],
        revisionHint: 'Add one concrete example.'
      }
    ];

    vi.mocked(getGeminiFeedback).mockResolvedValue(geminiPayload);
    vi.mocked(mapGeminiToFeedback).mockReturnValue(mappedFeedback);

    const response = await request(app).post('/api/feedback').send({
      mode: 'miniEssay',
      level: 'paragraph',
      text: 'Essay text',
      prompt: 'Discuss both views.'
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ feedback: mappedFeedback });
    expect(getGeminiFeedback).toHaveBeenCalledWith({
      mode: 'miniEssay',
      level: 'paragraph',
      text: 'Essay text',
      prompt: 'Discuss both views.'
    });
    expect(mapGeminiToFeedback).toHaveBeenCalledWith(
      geminiPayload,
      'paragraph',
      'Essay text'
    );
  });

  it('returns 400 when request body is invalid', async () => {
    const response = await request(app).post('/api/feedback').send({
      mode: 'not-valid',
      level: 'paragraph',
      text: '',
      prompt: ''
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid feedback request' });
    expect(getGeminiFeedback).not.toHaveBeenCalled();
  });

  it('returns 400 when text or prompt exceeds max length', async () => {
    const response = await request(app).post('/api/feedback').send({
      mode: 'thesis',
      level: 'sentence',
      text: 'x'.repeat(5001),
      prompt: 'p'.repeat(1001)
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid feedback request' });
    expect(getGeminiFeedback).not.toHaveBeenCalled();
  });

  it('returns 502 when feedback provider fails', async () => {
    vi.mocked(getGeminiFeedback).mockRejectedValue(new Error('provider down'));

    const response = await request(app).post('/api/feedback').send({
      mode: 'paragraph',
      level: 'sentence',
      text: 'Body text.',
      prompt: 'Give me feedback.'
    });

    expect(response.status).toBe(502);
    expect(response.body).toEqual({ error: 'Feedback service unavailable' });
  });

  it('returns 200 and passes malformed provider payload to mapper', async () => {
    const malformedPayload = { feedback: [null] };
    const mappedFallback: FeedbackUnit[] = [
      {
        level: 'sentence',
        targetText: 'Body text.',
        strengths: [],
        issues: [],
        revisionHint: ''
      }
    ];

    vi.mocked(getGeminiFeedback).mockResolvedValue(malformedPayload);
    vi.mocked(mapGeminiToFeedback).mockReturnValue(mappedFallback);

    const response = await request(app).post('/api/feedback').send({
      mode: 'paragraph',
      level: 'sentence',
      text: 'Body text.',
      prompt: 'Give me feedback.'
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ feedback: mappedFallback });
    expect(mapGeminiToFeedback).toHaveBeenCalledWith(malformedPayload, 'sentence', 'Body text.');
  });

  it('returns 500 when mapper throws unexpectedly', async () => {
    vi.mocked(getGeminiFeedback).mockResolvedValue({ feedback: [{ targetText: 'x' }] });
    vi.mocked(mapGeminiToFeedback).mockImplementation(() => {
      throw new Error('mapper failure');
    });

    const response = await request(app).post('/api/feedback').send({
      mode: 'paragraph',
      level: 'sentence',
      text: 'Body text.',
      prompt: 'Give me feedback.'
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });
});
