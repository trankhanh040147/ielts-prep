# ModePicker — Info on Hover

**Date:** 2026-04-14
**Status:** Approved

## Problem

The ModePicker currently shows three plain buttons — "Thesis Drill", "Paragraph Drill", "Mini Essay Drill" — with no explanation. New users have no idea what each mode involves, how to approach it, or how the AI will evaluate their writing.

## Solution

Add a hover-triggered info panel below the mode buttons. The panel is hidden by default and appears only when the user hovers over a button, showing a concise description, evaluation criteria, and a good example for that mode.

## Behavior

- **Default state:** No panel visible. Buttons behave as before.
- **Hover a button:** Info panel slides in below the buttons, showing content for the hovered mode.
- **Leave hover:** Panel hides.
- **Active button highlight:** Unchanged — the currently selected mode remains visually highlighted regardless of hover state.

## Info Panel Content

Each mode has three columns:

| Column | Content |
|--------|---------|
| Description | What skill this mode trains, how to approach it (2–3 sentences) |
| Evaluation criteria | 3 bullet points — what the AI will assess |
| Good example | 1 sentence or short passage demonstrating quality output |

### Thesis Drill
- **Description:** Luyện viết câu luận điểm — phần cốt lõi của phần mở bài. Đọc đề, xác định dạng câu hỏi, rồi viết 1–2 câu thesis thể hiện rõ lập trường.
- **Criteria:** Trả lời thẳng câu hỏi đề bài · Lập trường rõ ràng, nhất quán · Không quá chung chung
- **Example:** "While railways suit long-distance travel, roads remain vital locally, and governments should fund both proportionally."

### Paragraph Drill
- **Description:** Luyện viết 1 đoạn thân bài hoàn chỉnh theo cấu trúc: topic sentence → lập luận → ví dụ → kết đoạn.
- **Criteria:** Topic sentence bám đề · Lập luận logic, có dẫn chứng · Kết đoạn liên kết ý chính
- **Example:** "One key advantage of railways is their capacity to reduce urban congestion. By transporting large volumes of passengers efficiently, they ease pressure on road networks."

### Mini Essay Drill
- **Description:** Luyện viết bài ngắn đầy đủ cấu trúc (~200 từ): intro có thesis, 1–2 body paragraph, conclusion tóm gọn.
- **Criteria:** Cấu trúc bài rõ ràng · Coherence & cohesion tốt · Thesis — body — conclusion khớp nhau
- **Example:** "In conclusion, while both transport modes have merits, a balanced investment strategy would better serve diverse populations."

## Implementation

### File: `apps/web/src/components/ModePicker.tsx`

**Changes:**
1. Add `MODE_INFO` constant — a record mapping each `PracticeMode` to `{ description, criteria: string[], example }`.
2. Add local state `hoveredMode: PracticeMode | null` (default `null`).
3. Add `onMouseEnter` / `onMouseLeave` handlers on each button to set/clear `hoveredMode`.
4. Render info panel below the buttons, conditionally on `hoveredMode !== null`, using the data from `MODE_INFO[hoveredMode]`.

No changes to other files. No new files needed.

### Info panel structure (JSX sketch)

```tsx
{hoveredMode && (
  <div role="tooltip" aria-live="polite">
    <div>{MODE_INFO[hoveredMode].description}</div>
    <ul>
      {MODE_INFO[hoveredMode].criteria.map(c => <li key={c}>{c}</li>)}
    </ul>
    <blockquote>{MODE_INFO[hoveredMode].example}</blockquote>
  </div>
)}
```

## Out of Scope

- Keyboard / touch support (hover-only for now; acceptable for v0.1 demo)
- Styling / CSS (app currently unstyled; no styles added)
- Animations / transitions
- Changes to any other component
