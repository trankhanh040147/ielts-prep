# ielts-prep

Small monorepo for IELTS Writing practice.

## Requirements

- Node.js 20+
- npm 10+

## Setup

```bash
npm install
```

## Run

Start API and web together (recommended):

```bash
npm run dev
```

Or run them in separate terminals:

```bash
npm run dev:api
npm run dev:web
```

## Test

Run all test suites from the repo root:

```bash
npm test
```

Run a specific suite:

```bash
npm run -w apps/api test
npm run -w apps/web test
```

## Build

Build both API and web app from the repo root:

```bash
npm run build
```

## Ready-Now Verification

Use the v0.1 ready-now checklist:

- `docs/superpowers/checklists/v0.1-ready-now-checklist.md`

Record fresh command evidence in:

- `docs/ielts-prep-v0.1-output-latest.md`

Backward-compatible dated note remains at:

- `docs/ielts-prep-v0.1-output-2026-04-08.md`

Required verification commands:

```bash
npm test
npm run build
```
