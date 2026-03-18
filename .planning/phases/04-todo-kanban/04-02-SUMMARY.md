---
phase: 04-todo-kanban
plan: 02
subsystem: ui
tags: [react, dnd-kit, zustand, todo-panel, sidebar, drag-and-drop]

requires:
  - phase: 04-01
    provides: "Task store with CRUD, columns, reorder, complete/uncomplete"
  - phase: 01-02
    provides: "AppShell layout with sidebar push transition pattern"
provides:
  - "TodoPanel right sidebar with scrollable task list"
  - "TodoItem with checkbox, inline edit, drag handle"
  - "TodoInput sticky bottom for quick task capture"
  - "TodoPanelToggle button with Cmd+Shift+T shortcut"
  - "UI store todoPanelOpen with Dexie settings persistence"
  - "AppShell integration with mr-[280px] push transition"
affects: [04-03, 06-command-palette]

tech-stack:
  added: []
  patterns:
    - "Right sidebar push layout mirroring left sidebar pattern"
    - "Panel state persistence via db.settings key-value"
    - "dnd-kit sortable list with DragOverlay for visual feedback"

key-files:
  created:
    - components/todo/TodoPanel.tsx
    - components/todo/TodoItem.tsx
    - components/todo/TodoInput.tsx
    - components/todo/TodoPanelToggle.tsx
    - hooks/useTodoPanelToggle.ts
  modified:
    - lib/stores/ui-store.ts
    - components/layout/AppShell.tsx
    - components/feedback/SaveStatus.tsx
    - entrypoints/newtab/App.tsx
    - entrypoints/newtab/style.css

key-decisions:
  - "Checkbox uses custom styled button instead of Radix primitive for simplicity"
  - "Drag handle and delete button only appear on hover to keep UI clean"
  - "Double-click to edit task title inline with input swap pattern"
  - "2-second delay before completeTask call gives user visual feedback before item moves to Done column"

patterns-established:
  - "Right panel toggle: fixed position button that shifts with panel open/close state"
  - "SaveStatus positioning adjusts dynamically based on todoPanelOpen state"

requirements-completed: [TODO-01, TODO-05]

duration: 4min
completed: 2026-03-19
---

# Phase 04 Plan 02: Todo Panel UI Summary

**Right-sidebar todo panel with dnd-kit sortable list, checkbox completion with fade-out, sticky add input, and Cmd+Shift+T toggle integrated into AppShell**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-18T20:48:03Z
- **Completed:** 2026-03-18T20:52:25Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Built TodoPanel as 280px right sidebar with translateX slide-in animation matching left sidebar pattern
- Implemented dnd-kit sortable list with PointerSensor (5px activation distance), DragOverlay for visual feedback
- Created TodoItem with custom checkbox, 2-second completion delay, inline title editing, hover-reveal drag handle and delete button
- Extended UI store with todoPanelOpen persistence via Dexie settings and useTodoPanelToggle hook with Cmd+Shift+T shortcut
- Integrated panel into AppShell with margin-right push transition, coexisting with left sidebar and focus mode

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend UI store with todo panel state and create panel toggle hook** - `fec2f4d` (feat)
2. **Task 2: Build TodoPanel components and integrate into AppShell** - `b24dcc2` (feat)

## Files Created/Modified
- `components/todo/TodoPanel.tsx` - Right sidebar container with DnD sortable task list, empty state, header
- `components/todo/TodoItem.tsx` - Individual todo with checkbox, inline edit, drag handle, delete
- `components/todo/TodoInput.tsx` - Sticky bottom input with Enter-to-submit
- `components/todo/TodoPanelToggle.tsx` - CheckSquare icon button for header area
- `hooks/useTodoPanelToggle.ts` - Toggle hook with Cmd+Shift+T keyboard shortcut
- `lib/stores/ui-store.ts` - Added todoPanelOpen state with Dexie persistence
- `components/layout/AppShell.tsx` - Integrated TodoPanel, TodoPanelToggle, mr-[280px] transition
- `components/feedback/SaveStatus.tsx` - Dynamic right positioning based on panel state
- `entrypoints/newtab/App.tsx` - Task store initialization and panel state loading
- `entrypoints/newtab/style.css` - Added spacing-todo-panel and spacing-kanban-column tokens

## Decisions Made
- Custom styled checkbox button instead of Radix primitive -- simpler for the todo context and avoids adding another Radix dependency
- Drag handle and delete button only visible on hover to keep the list visually clean
- Double-click to edit task title using input swap pattern (not contentEditable)
- 2-second delay on check before calling completeTask, giving visual line-through feedback before the item moves to Done column
- TodoPanel respects focusMode -- hidden when focus mode is active

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] AppShell had focus mode from Phase 06**
- **Found during:** Task 2 (AppShell integration)
- **Issue:** AppShell already had focus mode integration from a later phase, changing the structure from what the plan expected
- **Fix:** Integrated todo panel alongside focus mode, hiding panel when focusMode is active
- **Files modified:** components/layout/AppShell.tsx
- **Verification:** Both focus mode and todo panel work correctly, panel hidden in focus mode

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Minor structural adaptation for focus mode coexistence. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Todo panel UI complete, ready for kanban board view (Plan 03)
- Task store CRUD verified working through panel integration
- All 74 existing tests pass with no regressions

---
*Phase: 04-todo-kanban*
*Completed: 2026-03-19*
