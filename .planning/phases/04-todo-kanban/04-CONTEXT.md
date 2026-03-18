# Phase 4: Todo + Kanban - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

A dedicated always-visible todo panel on the new tab page and a kanban board view for visual task management. Todos and kanban cards share a unified data model -- the todo panel is a flat list view and the kanban board is a column-based view of the same task data. This phase builds on the storage layer and app shell from Phase 1. It does NOT include task linking to notes, recurring tasks, or task notifications.

</domain>

<decisions>
## Implementation Decisions

### Todo Panel Placement & Visibility
- Right sidebar panel (opposite side from page navigation sidebar)
- Panel width: 280px, pushes main content (same pattern as left sidebar with margin transition)
- Toggle via icon button in the header bar area (top-right)
- Open/closed state persists across sessions via settings storage
- Panel coexists with left sidebar -- both can be open simultaneously

### Kanban Board Location
- Kanban board renders in the full main content area (where editor normally lives)
- Fixed "Kanban Board" entry in the left sidebar, below the page tree -- acts like a built-in page
- Clicking it loads the kanban view, replacing the editor in the main content area

### Kanban Columns
- Default 3 columns: To Do, In Progress, Done
- Fully customizable: users can add, rename, delete, and reorder columns
- Columns scroll horizontally if they overflow the viewport

### Kanban Card Design
- Title only, minimal -- clean Notion-style cards
- No description, labels, or dates in v1

### Unified Data Model (Todo-Kanban Relationship)
- One task data model shared between todo panel and kanban board
- Todo panel shows all non-completed tasks (everything not in the "Done" column)
- Checking a todo in the panel moves it to the "Done" column in kanban
- Adding a todo from the panel places it in the first column ("To Do")
- Kanban board shows all tasks grouped by column, including completed
- Drag-and-drop works in both views: reorder in todo panel, move between columns in kanban

### Claude's Discretion
- Exact task data schema and Dexie table design
- Drag-and-drop library choice and implementation (dnd-kit likely, matching Phase 3 sidebar plans)
- Todo panel empty state design
- Kanban board empty state (no columns or no cards)
- Add-task input UX details (inline input at bottom of panel vs floating input)
- Column header styling and add-column UX
- Animation and transition timing for panel toggle and card drag

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` -- Core value, constraints, key decisions (Notion-comparable UX bar)
- `.planning/REQUIREMENTS.md` -- TODO-01 through TODO-05, KANB-01 through KANB-05 requirements for this phase
- `.planning/ROADMAP.md` -- Phase 4 goal, success criteria, dependencies

### Prior phase context
- `.planning/phases/01-foundation-app-shell/01-CONTEXT.md` -- Dark theme decisions (warm grays, blue accent, monospace typography, flat surfaces), storage UX (300ms debounce), sidebar pattern (240px push, 250ms transition), Zustand stores, Dexie.js storage

### Research
- `.planning/research/STACK.md` -- Recommended stack (WXT, React, Dexie.js, Zustand, Tailwind)
- `.planning/research/SUMMARY.md` -- Architecture approach, phase implications

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/storage/storage-service.ts`: StorageService abstraction over Dexie -- todo/kanban data should use a new Dexie table through this service
- `lib/storage/types.ts`: NoteRecord, TreeIndex, SettingsRecord types -- task types follow same pattern
- `lib/stores/notes-store.ts`: Zustand store with cache + Dexie persistence -- task store should follow same pattern
- `lib/stores/ui-store.ts`: UI state management -- todo panel open/closed state lives here
- `hooks/useToast.ts`: Toast notifications for error feedback
- `hooks/useSidebarToggle.ts`: Sidebar toggle pattern -- right panel toggle should mirror this
- `components/layout/AppShell.tsx`: Main layout with sidebar + main content -- needs extension for right panel
- `components/skeleton/`: Skeleton loading components -- create similar for todo panel

### Established Patterns
- Zustand stores with async init + cache for state management
- Dexie.js/IndexedDB with granular key-per-record storage
- Tailwind CSS with dark theme tokens (bg-bg, text-text-primary, font-mono)
- Margin-left transition for push-content sidebar behavior (250ms ease-in-out)
- crypto.randomUUID() for record IDs

### Integration Points
- AppShell.tsx: Add right panel alongside existing sidebar + main content
- StorageService: Add task table and CRUD operations
- UI Store: Add todoPanelOpen state with persistence
- Sidebar: Add fixed "Kanban Board" navigation entry below page tree
- MainContent: Conditionally render kanban board vs editor based on active view

</code_context>

<specifics>
## Specific Ideas

- Todo panel should feel like a quick-capture sidebar -- fast to add, fast to check off
- Kanban board should feel like Notion's board view -- clean columns, smooth card dragging
- The unified data model means everything stays in sync -- no confusion about where tasks live

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 04-todo-kanban*
*Context gathered: 2026-03-19*
