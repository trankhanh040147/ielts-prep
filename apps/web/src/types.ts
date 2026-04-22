export type PracticeMode = 'thesis' | 'paragraph' | 'miniEssay'
export type FeedbackLevel = 'sentence' | 'paragraph'
export type FeedbackUnit = {
  level: FeedbackLevel
  targetText: string
  strengths: string[]
  issues: string[]
  revision: {
    explanation: string
    rewrites: string[]
  }
}
export type PracticeRecord = {
  id: string
  mode: PracticeMode
  prompt: string
  topicName: string
  draft: string
  feedback: FeedbackUnit[]
  updatedAt: string
}
export type TopicResponse = { prompt: string; topicName: string }
