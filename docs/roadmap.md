# IELTS Prep — Roadmap

## v0.1 — Done ✅

**Goal:** One working writing loop, local-first, no auth.

- 3 practice modes: Thesis Drill, Paragraph Drill, Mini Essay Drill
- AI feedback via Gemini (sentence-level & paragraph-level)
- Draft editor with error banner and retry on API failure
- Save to localStorage, reload history across sessions
- ModePicker with hover info panel (description, criteria, example per mode)

---

## v0.2 — Next

### UX & Onboarding
- [ ] Styling — apply a design system (Tailwind or CSS modules); currently unstyled
- [ ] Mobile-friendly layout
- [ ] Keyboard/touch support for mode info (currently hover-only)

### Practice Quality
- [ ] Expand prompt bank — multiple prompts per mode, random selection. Or generated with AI.
- [ ] Feedback diff view — highlight revised sentences against original draft
- [ ] Word count indicator in editor

### Feedback & Scoring
- [ ] Band score estimate per submission (Task Achievement, CC, LR, GRA)
- [ ] Feedback history per prompt — track improvement over multiple attempts

### Infrastructure
- [ ] Task 1 support (graph/chart/map/process descriptions)
- [ ] Cloud sync + auth (when local-only becomes a limitation)
