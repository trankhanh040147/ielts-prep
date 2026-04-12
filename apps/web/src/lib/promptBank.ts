import type { PracticeMode } from '../types';

export const promptBank: Record<PracticeMode, string> = {
  thesis: 'State your opinion clearly in one sentence.',
  paragraph: 'Write one focused body paragraph with a clear topic sentence.',
  miniEssay: 'Write a short essay with intro, body, and conclusion.'
};
