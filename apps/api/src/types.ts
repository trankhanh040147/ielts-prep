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

export type BandEstimate = {
  overall: number
  taskAchievement: number
  coherenceCohesion: number
  lexicalResource: number
  grammaticalRangeAccuracy: number
  summary: string
}
