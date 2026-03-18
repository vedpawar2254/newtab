---
phase: 4
slug: todo-kanban
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.x |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | TODO-01, TODO-04 | unit | `npx vitest run tests/task-store.test.ts` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | TODO-02, TODO-03 | unit | `npx vitest run tests/task-store.test.ts` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | KANB-02, KANB-05 | unit | `npx vitest run tests/task-store.test.ts` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 2 | TODO-01 | manual | visual inspection | N/A | ⬜ pending |
| 04-02-02 | 02 | 2 | TODO-02, TODO-05 | manual | visual + interaction | N/A | ⬜ pending |
| 04-02-03 | 02 | 2 | KANB-01, KANB-03, KANB-04 | manual | visual + interaction | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/task-store.test.ts` — stubs for task CRUD, column CRUD, persistence, ordering
- [ ] Vitest config already exists from Phase 1

*Existing test infrastructure (vitest.config.ts, tests/) covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Todo panel visible on new tab | TODO-01 | Visual layout verification | Open new tab, verify right panel visible with toggle |
| Drag-and-drop reorder todos | TODO-05 | Browser interaction required | Drag a todo item, verify new order persists on reload |
| Kanban card drag between columns | KANB-03 | Browser interaction required | Drag card from To Do to In Progress, verify column change persists |
| Kanban column customization | KANB-02 | Browser interaction required | Add column, rename column, delete column, verify persistence |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
