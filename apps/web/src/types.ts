export type PracticeMode = 'thesis' | 'paragraph' | 'miniEssay';

export type FeedbackLevel = 'sentence' | 'paragraph';

export type FeedbackUnit = {
  level: FeedbackLevel;
  targetText: string;
  strengths: string[];
  issues: string[];
  revisionHint: string;
};

export type FeedbackRequest = {
  mode: PracticeMode;
  level: FeedbackLevel;
  text: string;
  prompt: string;
};

export type FeedbackResponse = {
  feedback: FeedbackUnit[];
};

export type PracticeRecord = {
  id: string;
  mode: PracticeMode;
  prompt: string;
  draft: string;
  feedback: FeedbackUnit[];
  updatedAt: string;
};
