# IELTS Prep — Roadmap

## v0.1 — Done ✅

**Goal:** One working writing loop, local-first, no auth.

- 3 practice modes: Thesis Drill, Paragraph Drill, Mini Essay Drill
- AI feedback via Gemini (sentence-level & paragraph-level)
- Draft editor with error banner and retry on API failure
- Save to localStorage, reload history across sessions
- ModePicker with hover info panel (description, criteria, example per mode)

---

## v0.2 — Done ✅

### UX & Onboarding
- [x] Styling — Tailwind CSS v4 applied across all components
- [x] Mobile-friendly layout — single column on mobile, two-column on desktop
- [x] Keyboard/touch support for mode info — `?` button toggles info panel (was hover-only)

### Practice Quality
- [x] Feedback diff view — word-level diff per rewrite, tab toggle, draft context

---

## v0.3 — In Progress

### Topic Management
- [ ] **Next:** Topic picker — AI-generated prompts or user-pasted topic; history stores topic name (user-editable)

### Practice Quality
- [ ] Word count indicator in editor

### Feedback & Scoring
- [ ] Band score estimate per submission (Task Achievement, CC, LR, GRA)
- [ ] Feedback history per prompt — track improvement over multiple attempts

### Infrastructure
- [ ] Task 1 support (graph/chart/map/process descriptions)
- [ ] Cloud sync + auth (when local-only becomes a limitation)
