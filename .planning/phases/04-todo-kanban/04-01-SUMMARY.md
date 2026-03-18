---
phase: 04-todo-kanban
plan: 01
subsystem: database, state-management
tags: [dexie, zustand, kanban, tasks, indexeddb]

requires:
  - phase: 01-foundation
    provides: Dexie database setup, Zustand store pattern, storage types
provides:
  - TaskRecord, KanbanColumn, KanbanState type definitions
  - Dexie v2 migration with tasks table (columnId, order indexes)
  - useTaskStore Zustand store with full task and column CRUD
  - Default kanban columns (To Do, In Progress, Done) auto-created
affects: [04-02-todo-panel, 04-03-kanban-board]

tech-stack:
  added: []
  patterns: [unified-task-model-with-columnId, column-state-in-settings-table, task-prefix-ids]

key-files:
  created:
    - lib/stores/task-store.ts
    - tests/task-store.test.ts
  modified:
    - lib/storage/types.ts
    - lib/storage/db.ts

key-decisions:
  - "Column IDs use col- prefix and task IDs use task- prefix to avoid dnd-kit collision"
  - "Columns stored in settings table as kanban-columns key (KanbanState wrapper)"
  - "completeTask uses max-order column, uncompleteTask uses min-order column"
  - "Column deletion migrates tasks to first remaining column, prevents deleting last column"

patterns-established:
  - "Task store follows notes-store async init + Dexie persistence pattern"
  - "Prefixed IDs (col-, task-) for dnd-kit multi-container disambiguation"

requirements-completed: [TODO-02, TODO-03, TODO-04, KANB-02, KANB-04, KANB-05]

duration: 4min
completed: 2026-03-19
---

# Phase 04 Plan 01: Task Data Model and Store Summary

**Unified task data model with Dexie v2 migration and Zustand CRUD store for kanban columns and tasks**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-18T20:35:48Z
- **Completed:** 2026-03-18T20:39:33Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- TaskRecord, KanbanColumn, KanbanState types added to storage types
- Dexie schema migrated to v2 with tasks table (preserves v1 notes/settings)
- useTaskStore with full CRUD: add/update/delete tasks, complete/uncomplete, reorder tasks across columns
- Column CRUD: add/rename/delete/reorder columns with task migration on delete
- 19 unit tests covering all store operations

## Task Commits

Each task was committed atomically:

1. **Task 1: Define task types and migrate Dexie schema to v2** - `fc83516` (feat)
2. **Task 2: Create Zustand task store with CRUD and unit tests** - `0772e5d` (feat)

## Files Created/Modified
- `lib/storage/types.ts` - Added TaskRecord, KanbanColumn, KanbanState interfaces
- `lib/storage/db.ts` - Dexie v2 migration with tasks table, columnId/order indexes
- `lib/stores/task-store.ts` - Zustand task store with full CRUD for tasks and columns
- `tests/task-store.test.ts` - 19 unit tests covering initialize, crud, complete, columns, persist, reorder

## Decisions Made
- Column IDs use `col-` prefix and task IDs use `task-` prefix to avoid dnd-kit ID collision (per research pitfall #7)
- Columns stored in settings table under `kanban-columns` key as KanbanState wrapper
- completeTask finds last column by max order, uncompleteTask finds first column by min order
- Column deletion migrates tasks to first remaining column; last column cannot be deleted

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed vi.mock hoisting issue in tests**
- **Found during:** Task 2 (test creation)
- **Issue:** vi.mock factory cannot reference top-level `let` variables due to hoisting
- **Fix:** Changed to `const` Map declarations before vi.mock, which are hoisted correctly
- **Files modified:** tests/task-store.test.ts
- **Verification:** All 19 tests pass
- **Committed in:** 0772e5d (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Minor test mock structure fix. No scope creep.

## Issues Encountered
None beyond the vi.mock hoisting fix documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Task store ready for consumption by todo panel (Plan 02) and kanban board (Plan 03)
- Both UI plans can execute in parallel since they share this data layer
- Full test suite passes with 74 tests across 10 files (no regressions)

---
*Phase: 04-todo-kanban*
*Completed: 2026-03-19*
