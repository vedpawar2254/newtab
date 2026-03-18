---
phase: 1
slug: foundation-app-shell
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.x |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | FOUND-01 | manual | Chrome extension load test | N/A | ⬜ pending |
| TBD | TBD | TBD | FOUND-02 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | FOUND-03 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | FOUND-04 | manual | Visual inspection | N/A | ⬜ pending |
| TBD | TBD | TBD | FOUND-05 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | FOUND-06 | manual | Visual/interaction inspection | N/A | ⬜ pending |
| TBD | TBD | TBD | PAGE-07 | manual | Visual inspection of layout | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Install vitest + @testing-library/react as dev dependencies
- [ ] Create vitest.config.ts with WXT-compatible configuration
- [ ] Create test stubs for storage service (FOUND-02, FOUND-03, FOUND-05)

*Planner will fill in specific task IDs and test file paths.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Extension loads <500ms | FOUND-01 | Requires Chrome extension runtime | Load extension in Chrome, measure time to interactive via DevTools Performance tab |
| Dark theme renders correctly | FOUND-04 | Visual verification | Load extension, verify dark background colors match UI-SPEC (#191919, #252525) |
| Smooth UI transitions | FOUND-06 | Perceptual quality check | Toggle sidebar, verify 250ms slide animation with no jank |
| Notes-first layout | PAGE-07 | Visual layout verification | Verify sidebar left, main content center stage per UI-SPEC layout contract |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
