import type { PracticeMode } from '../types'

interface ModePickerProps {
  mode: PracticeMode
  onModeChange: (mode: PracticeMode) => void
}

export function ModePicker({ mode, onModeChange }: ModePickerProps) {
  return (
    <div>
      <button
        onClick={() => onModeChange('thesis')}
        aria-pressed={mode === 'thesis'}
      >
        Thesis Drill
      </button>
      <button
        onClick={() => onModeChange('paragraph')}
        aria-pressed={mode === 'paragraph'}
      >
        Paragraph Drill
      </button>
      <button
        onClick={() => onModeChange('miniEssay')}
        aria-pressed={mode === 'miniEssay'}
      >
        Mini Essay Drill
      </button>
    </div>
  )
}
