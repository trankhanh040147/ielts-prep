import { useState } from 'react'
import type { PracticeMode } from '../types'

interface ModePickerProps {
  mode: PracticeMode
  onModeChange: (mode: PracticeMode) => void
}

const MODE_INFO: Record<PracticeMode, { description: string; criteria: string[]; example: string }> = {
  thesis: {
    description:
      'Luyện viết câu luận điểm — phần cốt lõi của phần mở bài. Đọc đề, xác định dạng câu hỏi, rồi viết 1–2 câu thesis thể hiện rõ lập trường.',
    criteria: [
      'Trả lời thẳng câu hỏi đề bài',
      'Lập trường rõ ràng, nhất quán',
      'Không quá chung chung',
    ],
    example:
      '"While railways suit long-distance travel, roads remain vital locally, and governments should fund both proportionally."',
  },
  paragraph: {
    description:
      'Luyện viết 1 đoạn thân bài hoàn chỉnh theo cấu trúc: topic sentence → lập luận → ví dụ → kết đoạn.',
    criteria: [
      'Topic sentence bám đề',
      'Lập luận logic, có dẫn chứng',
      'Kết đoạn liên kết ý chính',
    ],
    example:
      '"One key advantage of railways is their capacity to reduce urban congestion. By transporting large volumes of passengers efficiently, they ease pressure on road networks."',
  },
  miniEssay: {
    description:
      'Luyện viết bài ngắn đầy đủ cấu trúc (~200 từ): intro có thesis, 1–2 body paragraph, conclusion tóm gọn.',
    criteria: [
      'Cấu trúc bài rõ ràng',
      'Coherence & cohesion tốt',
      'Thesis — body — conclusion khớp nhau',
    ],
    example:
      '"In conclusion, while both transport modes have merits, a balanced investment strategy would better serve diverse populations."',
  },
}

export function ModePicker({ mode, onModeChange }: ModePickerProps) {
  const [hoveredMode, setHoveredMode] = useState<PracticeMode | null>(null)
  const [pinnedMode, setPinnedMode] = useState<PracticeMode | null>(null)

  const activeMode = pinnedMode || hoveredMode
  const info = activeMode ? MODE_INFO[activeMode] : null

  return (
    <div>
      <div className="flex gap-2 flex-wrap mb-4">
        {(['thesis', 'paragraph', 'miniEssay'] as PracticeMode[]).map((m) => {
          const isActive = mode === m
          return (
            <div
              key={m}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-700'
              }`}
              onMouseEnter={() => setHoveredMode(m)}
              onMouseLeave={() => setHoveredMode(null)}
            >
              <button
                onClick={() => onModeChange(m)}
                aria-pressed={isActive}
                className="focus:outline-none"
              >
                {m === 'thesis' ? 'Thesis Drill' : m === 'paragraph' ? 'Paragraph Drill' : 'Mini Essay Drill'}
              </button>
              <button
                type="button"
                onClick={() => setPinnedMode(pinnedMode === m ? null : m)}
                onFocus={() => setPinnedMode(m)}
                onBlur={() => {
                  setTimeout(() => setPinnedMode(null), 200)
                }}
                aria-label={`More info about ${m === 'thesis' ? 'Thesis' : m === 'paragraph' ? 'Paragraph' : 'Mini Essay'}`}
                aria-expanded={pinnedMode === m}
                className="ml-1 text-xs px-1 opacity-60 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-current rounded-full"
              >
                ?
              </button>
            </div>
          )
        })}
      </div>
      {info && (
        <div role="tooltip" aria-live="polite" className="mt-3 p-4 rounded-lg bg-indigo-50 border border-indigo-100 text-sm">
          <p className="text-slate-700 mb-2">{info.description}</p>
          <ul className="list-disc pl-4 text-slate-600 space-y-1 mb-2">
            {info.criteria.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <blockquote className="italic text-slate-500 border-l-2 border-indigo-300 pl-3 mt-2">{info.example}</blockquote>
        </div>
      )}
    </div>
  )
}
