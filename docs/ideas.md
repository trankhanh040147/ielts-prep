# Goals
- [ ] Build a simple IELTS Writing Task 2 prep demo.
- [ ] Support 1-1 practice with realtime feedback at sentence/paragraph level.
- [ ] Keep v0.1 small so we can review and expand later with other agents.

---

# v0.1 Demo Scope (Simple)

## Product Goal
- ship a web-only, local-first writing demo with one loop:
  - choose Task 2 mode
  - write
  - get realtime feedback
  - revise
  - save

## Locked Scope
- Task 2 only
- 3 practice modes:
  1. thesis drill
  2. paragraph drill
  3. mini essay drill
- feedback granularity:
  - per sentence
  - per paragraph
- local persistence only

## Out Of Scope (v0.1)
- Task 1 support
- cloud/auth/sync
- full analytics dashboard
- advanced scoring model and band prediction
- UI polish and animation work

## Tonight Definition Of Done
- one working writing loop (`mode -> write -> feedback -> revise -> save`)
- two sample practices completed and saved
- output log completed in [[10-projects/active/ielts-prep/ielts-prep-v0.1-output-2026-04-08]]

## Questions To Decide Later (with agents)
- feedback source and quality strategy
- scoring approach and rubric depth
- prompt bank structure and expansion plan
