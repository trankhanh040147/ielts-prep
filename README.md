# IELTS Writing Prep v0.1

A web app for IELTS Writing Task 2 practice. Users select a practice mode, write a draft, receive real-time AI feedback (via Gemini), revise, and save — with local history that persists across sessions.

## Prerequisites

- Node.js 18+
- npm 9+
- A Google Gemini API key

## Setup

```bash
# Install all workspace dependencies
npm install

# Copy the API environment template and set your key
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env and set GEMINI_API_KEY=your_key_here
```

## Running

```bash
# Start both the API and web app in development mode
npm run dev
```

- API runs on http://localhost:3000
- Web app runs on http://localhost:5173

## Testing

```bash
# Run all tests (API + web)
npm run test

# Run API tests only
npm --workspace apps/api run test

# Run web tests only
npm --workspace apps/web run test
```

## Architecture

```
ModePicker → PromptCard → DraftEditor
  → POST /api/feedback { mode, level, text, prompt }
  → geminiClient → feedbackMapper → FeedbackUnit[]
  → FeedbackPanel → SavePracticeButton → localStorage → HistoryList
```

### Three practice modes

| Mode | Description |
|------|-------------|
| `thesis` | Write and refine a thesis statement |
| `paragraph` | Develop a single body paragraph |
| `miniEssay` | Write a short complete essay |

### Feedback levels

- **Check Sentence** — sentence-level feedback on grammar, clarity, and word choice
- **Check Paragraph** — paragraph-level feedback on structure, coherence, and development

### Persistence

All history is stored in `localStorage` under the key `ieltsPrep.v0.1.history`. No backend database or authentication is required.

### Monorepo structure

```
Root (npm workspaces)
├── apps/api   — Express + TypeScript backend: validates requests, calls Gemini, normalizes feedback
└── apps/web   — React + Vite frontend: UI, state, localStorage persistence
```
