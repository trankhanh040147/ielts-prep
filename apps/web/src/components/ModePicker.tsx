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
  const info = hoveredMode ? MODE_INFO[hoveredMode] : null

  return (
    <div>
      <div>
        {(['thesis', 'paragraph', 'miniEssay'] as PracticeMode[]).map((m) => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            onMouseEnter={() => setHoveredMode(m)}
            onMouseLeave={() => setHoveredMode(null)}
            aria-pressed={mode === m}
          >
            {m === 'thesis' ? 'Thesis Drill' : m === 'paragraph' ? 'Paragraph Drill' : 'Mini Essay Drill'}
          </button>
        ))}
      </div>
      {info && (
        <div role="tooltip" aria-live="polite">
          <p>{info.description}</p>
          <ul>
            {info.criteria.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <blockquote>{info.example}</blockquote>
        </div>
      )}
    </div>
  )
}
