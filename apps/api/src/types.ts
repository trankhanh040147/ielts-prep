export type PracticeMode = 'thesis' | 'paragraph' | 'miniEssay'
export type FeedbackLevel = 'sentence' | 'paragraph'

export type FeedbackUnit = {
  level: FeedbackLevel
  targetText: string
  strengths: string[]
  issues: string[]
  revisionHint: string
}
