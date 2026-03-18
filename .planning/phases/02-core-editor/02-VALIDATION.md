---
phase: 2
slug: core-editor
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts (created in Phase 1 or Wave 0) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | EDIT-01 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | EDIT-02 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | EDIT-03 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | EDIT-04 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | EDIT-05 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | EDIT-06 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | EDIT-07 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | EDIT-08 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | EDIT-09 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | EDIT-10 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | EDIT-11 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | EDIT-12 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Vitest test infrastructure (if not created in Phase 1)
- [ ] Test stubs for all EDIT-xx requirements
- [ ] Shared test fixtures for Tiptap editor rendering

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Drag-and-drop block reordering | EDIT-10 | Requires mouse interaction simulation | Drag a block to new position, verify order persists after reload |
| Slash command menu keyboard navigation | EDIT-11 | Complex keyboard interaction flow | Type /, use arrow keys, press Enter, verify block inserted |
| Floating toolbar appearance on text selection | EDIT-01 | Visual positioning verification | Select text, verify toolbar appears above selection with correct options |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
