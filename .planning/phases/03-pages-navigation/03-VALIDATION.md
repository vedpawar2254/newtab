---
phase: 3
slug: pages-navigation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts (expected from Phase 1) |
| **Quick run command** | `pnpm vitest run --reporter=verbose` |
| **Full suite command** | `pnpm vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm vitest run --reporter=verbose`
- **After every plan wave:** Run `pnpm vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | PAGE-01 | integration | `pnpm vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | PAGE-02 | integration | `pnpm vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | PAGE-03 | integration | `pnpm vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | PAGE-04 | integration | `pnpm vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | PAGE-05 | integration | `pnpm vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | PAGE-06 | integration | `pnpm vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Test stubs for PAGE-01 through PAGE-06
- [ ] Shared test fixtures for tree hierarchy data
- [ ] vitest + @testing-library/react setup (if not from Phase 1)

*Updated by planner with specific task IDs and test file paths.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Drag-and-drop reordering | PAGE-06 | DnD requires pointer events simulation | Drag page in sidebar, verify new position persists |
| Auto-expand on hover during drag | PAGE-06 | Complex pointer timing | Drag page over collapsed parent, wait 500ms, verify expansion |
| Inline rename via double-click | PAGE-04 | Double-click timing | Double-click page name, type new name, press Enter |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
