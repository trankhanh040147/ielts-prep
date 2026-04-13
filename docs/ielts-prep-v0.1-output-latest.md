# IELTS Prep v0.1 Output Log (latest)

Last verification run: 2026-04-13

This file is the stable location for the most recent ready-now command evidence.

## Verification commands and evidence

### `npm install`
- Result: PASS
- Outcome: dependencies already up to date.
- Audit note: 2 moderate vulnerabilities reported (`npm audit` for details).

### `npm test`
- Result: PASS
- Root script: `npm run -w apps/api test && npm run -w apps/web test`
- API (`apps/api`): 4 files passed, 19 tests passed.
- Web (`apps/web`): 2 files passed, 16 tests passed.
- Noted warnings during web tests:
  - ``--localstorage-file was provided without a valid path``

### `npm run build`
- Result: PASS
- Root script: `npm run -w apps/api build && npm run -w apps/web build`
- API build: PASS (`tsc -p tsconfig.json`)
- Web build: PASS (`tsc -b && vite build`)
- Bundle summary (`apps/web/dist`):
  - `index.html` 0.32 kB (gzip 0.24 kB)
  - `assets/index-D0gzwfmA.js` 148.29 kB (gzip 47.80 kB)

### Manual smoke attempt (UI)
- `npm run dev`: PASS (API on `http://localhost:3001`, web on `http://localhost:5173`)
- Browser automation availability: FAIL in this environment
  - `chrome-devtools_new_page` error: `Could not find Google Chrome executable at /opt/google/chrome/chrome`
  - `next-devtools_browser_eval` navigation error: `Chromium distribution 'chrome' is not found`
- Outcome: UI smoke steps are not verified here due missing browser binary.

## Environment metadata

- Platform: Linux
- Node.js: v25.6.1
- npm: 11.9.0

## Scope of this log

- Contains only automated command evidence from the latest ready-now verification run.
- No manual browser/demo claims are included.
