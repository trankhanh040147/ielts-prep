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

Start the API server:

```bash
npm run dev
```

Run the web app in a second terminal:

```bash
npm run -w apps/web dev
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
