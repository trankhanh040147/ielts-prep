import { GoogleGenerativeAI } from '@google/generative-ai';

import type { FeedbackLevel, PracticeMode } from '../types';

type GeminiFeedbackInput = {
  mode: PracticeMode;
  level: FeedbackLevel;
  text: string;
  prompt: string;
};

type GeminiFeedbackResponse = {
  feedback: unknown[];
};

const DEFAULT_MODEL = 'gemini-1.5-flash';

const toGeminiPrompt = ({ mode, level, text, prompt }: GeminiFeedbackInput): string => {
  return [
    'You are an IELTS writing feedback assistant.',
    'Return valid JSON only with shape {"feedback":[{"targetText":"...","strengths":["..."],"issues":["..."],"revisionHint":"..."}]}.',
    `Mode: ${mode}`,
    `Level: ${level}`,
    `Task prompt: ${prompt}`,
    `Learner text: ${text}`
  ].join('\n');
};

const extractText = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const toFallbackResponse = (): GeminiFeedbackResponse => ({
  feedback: []
});

const extractFencedBlocks = (text: string): string[] => {
  const pattern = /```(?:json)?\s*([\s\S]*?)```/gi;
  const blocks: string[] = [];

  for (const match of text.matchAll(pattern)) {
    const block = extractText(match[1]);
    if (block) {
      blocks.push(block);
    }
  }

  return blocks;
};

const extractBalancedJsonObjects = (text: string): string[] => {
  const candidates: string[] = [];

  for (let start = 0; start < text.length; start += 1) {
    if (text[start] !== '{') {
      continue;
    }

    let depth = 0;
    let inString = false;
    let isEscaped = false;

    for (let index = start; index < text.length; index += 1) {
      const char = text[index];

      if (isEscaped) {
        isEscaped = false;
        continue;
      }

      if (char === '\\') {
        isEscaped = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (inString) {
        continue;
      }

      if (char === '{') {
        depth += 1;
        continue;
      }

      if (char !== '}') {
        continue;
      }

      depth -= 1;
      if (depth === 0) {
        candidates.push(text.slice(start, index + 1));
        break;
      }
    }
  }

  return candidates;
};

const toParseCandidates = (text: string): string[] => {
  const uniqueCandidates = new Set<string>();

  const addCandidate = (candidate: string): void => {
    const normalized = extractText(candidate);
    if (normalized) {
      uniqueCandidates.add(normalized);
    }
  };

  addCandidate(text);

  for (const fencedBlock of extractFencedBlocks(text)) {
    addCandidate(fencedBlock);
  }

  for (const candidate of extractBalancedJsonObjects(text)) {
    addCandidate(candidate);
  }

  for (const fencedBlock of extractFencedBlocks(text)) {
    for (const candidate of extractBalancedJsonObjects(fencedBlock)) {
      addCandidate(candidate);
    }
  }

  return [...uniqueCandidates];
};

const toGeminiFeedbackResponse = (value: unknown): GeminiFeedbackResponse => {
  if (typeof value !== 'object' || value === null) {
    return toFallbackResponse();
  }

  const maybeFeedback = (value as { feedback?: unknown }).feedback;
  if (!Array.isArray(maybeFeedback)) {
    return toFallbackResponse();
  }

  return {
    feedback: maybeFeedback
  };
};

const hasValidFeedbackArray = (value: unknown): value is { feedback: unknown[] } => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return Array.isArray((value as { feedback?: unknown }).feedback);
};

export const parseGeminiFeedbackText = (text: string): GeminiFeedbackResponse => {
  for (const candidate of toParseCandidates(text)) {
    try {
      const parsed = JSON.parse(candidate);
      if (!hasValidFeedbackArray(parsed)) {
        continue;
      }

      return toGeminiFeedbackResponse(parsed);
    } catch {
      continue;
    }
  }

  return toFallbackResponse();
};

export const getGeminiFeedback = async (
  input: GeminiFeedbackInput
): Promise<GeminiFeedbackResponse> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY');
  }

  const modelName = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({ model: modelName });
  const response = await model.generateContent(toGeminiPrompt(input));

  const text = extractText(response.response.text());
  if (!text) {
    return toFallbackResponse();
  }

  return parseGeminiFeedbackText(text);
};

export type { GeminiFeedbackInput, GeminiFeedbackResponse };
