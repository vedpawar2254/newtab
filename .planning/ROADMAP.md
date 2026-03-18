# Roadmap: NewTab

## Overview

NewTab is a Chrome extension replacing the new tab page with a Notion-comparable productivity workspace. The build order is strictly dependency-driven: storage and app shell first (everything depends on reliable persistence), then the core editor (the entire value proposition), then page organization (primary differentiator), then task management views, then productivity widgets, and finally power-user UX features that compound value across everything built before them.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation + App Shell** - Chrome extension scaffold with storage layer, dark theme, and notes-first layout shell
- [ ] **Phase 2: Core Editor** - Rich text block editor with markdown shortcuts, formatting, code blocks, and all block types
- [ ] **Phase 3: Pages + Navigation** - Nested page hierarchy with sidebar tree, drag-and-drop, and page management
- [ ] **Phase 4: Todo + Kanban** - Dedicated todo panel and kanban board view for task management
- [ ] **Phase 5: Productivity Widgets** - Pomodoro timer, habit tracker, daily journal, quotes, and whiteboard
- [ ] **Phase 6: UX + Polish** - Command palette, full-text search, focus mode, keyboard navigation, and animation polish

## Phase Details

### Phase 1: Foundation + App Shell
**Goal**: A working Chrome extension that loads in under 500ms, persists data reliably with granular storage, and renders a dark-themed notes-first shell ready to host features
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, PAGE-07
**Success Criteria** (what must be TRUE):
  1. Extension installs and replaces new tab with a dark-themed page that reaches interactive in under 500ms
  2. Data written to storage persists across tab closes and browser restarts without loss
  3. The layout shows a collapsible sidebar on the left and a main content area center stage (notes-first)
  4. UI transitions and interactions (sidebar toggle, panel switching) feel smooth with no jank
  5. Storage uses per-note keys with a lightweight index -- not a single JSON blob
**Plans**: 3 plans

Plans:
- [ ] 01-01-PLAN.md — Scaffold WXT project, storage layer (Dexie DB + StorageService), and Zustand stores
- [ ] 01-02-PLAN.md — App shell UI: dark-themed layout with sidebar, empty state, skeleton loading, animations
- [ ] 01-03-PLAN.md — Feedback UI (toasts, save status) and test infrastructure (Vitest)

### Phase 2: Core Editor
**Goal**: Users can create and edit notes with a Notion-quality block editor featuring rich text, markdown shortcuts, code blocks, tables, embeds, and slash commands
**Depends on**: Phase 1
**Requirements**: EDIT-01, EDIT-02, EDIT-03, EDIT-04, EDIT-05, EDIT-06, EDIT-07, EDIT-08, EDIT-09, EDIT-10, EDIT-11, EDIT-12
**Success Criteria** (what must be TRUE):
  1. User can type in the editor and apply bold, italic, underline, strikethrough, and headings via toolbar or markdown shortcuts
  2. User can insert code blocks with syntax highlighting, checkbox items, ordered/unordered lists, tables, and images via slash command menu
  3. User can drag and reorder blocks within a note and the new order persists
  4. Keyboard shortcuts work for all common formatting actions (Cmd+B, Cmd+I, etc.)
  5. Note content saves automatically and loads correctly when revisited
**Plans**: 5 plans

Plans:
- [ ] 02-01-PLAN.md — Tiptap editor foundation: install deps, extensions, title field, auto-save, CSS tokens
- [ ] 02-02-PLAN.md — Bubble toolbar (floating formatting bar) and slash command menu with categories
- [ ] 02-03-PLAN.md — Code block NodeView (language selector, copy button) and table controls (+ buttons)
- [ ] 02-04-PLAN.md — Image paste/drop, bookmark card link embeds, and drag-and-drop block handles
- [ ] 02-05-PLAN.md — Editor test suite and visual verification checkpoint

### Phase 3: Pages + Navigation
**Goal**: Users can organize notes into a nested page hierarchy with full sidebar navigation, drag-and-drop reordering, and page lifecycle management
**Depends on**: Phase 2
**Requirements**: PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-05, PAGE-06
**Success Criteria** (what must be TRUE):
  1. User can create new pages from the sidebar and nest any page inside another page to arbitrary depth
  2. Sidebar displays a collapsible tree showing the full page hierarchy with expand/collapse controls
  3. User can rename pages inline and delete pages from the sidebar
  4. User can drag and drop pages in the sidebar to reorder them or move them under a different parent
**Plans**: 2 plans

Plans:
- [ ] 03-01-PLAN.md — Tree utilities, store extensions, and sidebar tree UI (create, navigate, expand/collapse, rename)
- [ ] 03-02-PLAN.md — Drag-and-drop reordering/nesting with dnd-kit, context menu, and cascade delete

### Phase 4: Todo + Kanban
**Goal**: Users have a dedicated always-visible todo panel on the new tab page and can switch to a kanban board view for visual task management
**Depends on**: Phase 1
**Requirements**: TODO-01, TODO-02, TODO-03, TODO-04, TODO-05, KANB-01, KANB-02, KANB-03, KANB-04, KANB-05
**Success Criteria** (what must be TRUE):
  1. A dedicated todo panel is visible on the new tab page where users can add, edit, complete, and delete todos
  2. Todos persist across tab opens and can be reordered via drag-and-drop
  3. User can switch to a kanban board view with customizable columns and drag cards between them
  4. Kanban board state (columns, cards, card positions) persists across tab opens
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: Productivity Widgets
**Goal**: Users have access to a pomodoro timer, habit tracker, daily journal, motivational quotes, and a freeform whiteboard -- all as self-contained modules
**Depends on**: Phase 1
**Requirements**: PROD-01, PROD-02, PROD-03, PROD-04, PROD-05, PROD-06, PROD-07, PROD-08, PROD-09, QUOT-01, QUOT-02, QUOT-03, DRAW-01, DRAW-02, DRAW-03, DRAW-04, DRAW-05
**Success Criteria** (what must be TRUE):
  1. User can start, pause, and reset a pomodoro timer with configurable work/break durations and see completed session count
  2. User can add habits and track them daily with checkboxes, seeing streak counts for each habit
  3. A new dated journal note is auto-created each day with prompts, and past entries are accessible
  4. A motivational quote appears on the page and rotates daily or on refresh from a built-in library
  5. User can open a whiteboard canvas to draw shapes, lines, freehand, and text -- data persists and loads lazily
**Plans**: 5 plans

Plans:
- [ ] 05-01-PLAN.md — Foundation: widget types, Zustand stores, CSS tokens, quotes library, CollapsibleSection, QuoteFooter
- [ ] 05-02-PLAN.md — Pomodoro timer: SVG ring, start/pause/reset controls, duration config, notifications, audio chime
- [ ] 05-03-PLAN.md — Habit tracker: checklist with checkboxes, 7-day dots, streak counts, add/edit/remove
- [ ] 05-04-PLAN.md — Whiteboard: Excalidraw lazy-loaded, dark mode, scene persistence, view switching
- [ ] 05-05-PLAN.md — Journal section + sidebar integration: wire all widgets into Sidebar and AppShell

### Phase 6: UX + Polish
**Goal**: Users can navigate the entire app efficiently with a command palette, search across all notes, enter focus mode, and experience polished keyboard-driven interactions throughout
**Depends on**: Phase 2, Phase 3
**Requirements**: UX-01, UX-02, UX-03, UX-04, UX-05, UX-06
**Success Criteria** (what must be TRUE):
  1. User can press Cmd+K to open a command palette that searches notes, commands, and navigation targets
  2. User can search across all notes with full-text search and get results fast
  3. User can toggle focus mode which hides sidebar, todo panel, and quotes -- showing only the editor
  4. Full keyboard navigation works across all major surfaces (sidebar, editor, panels, command palette)
  5. All interactions across the app have smooth, polished animations and transitions
**Plans**: 2 plans

Plans:
- [ ] 06-01-PLAN.md — Command palette (Cmd+K) with cmdk, FlexSearch full-text search, recents, and command execution
- [ ] 06-02-PLAN.md — Focus mode (Cmd+.), keyboard navigation (arrow keys, Tab regions), and animation polish

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6
Note: Phases 4 and 5 depend only on Phase 1 and can be parallelized with Phases 2-3 if desired.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation + App Shell | 2/3 | In Progress|  |
| 2. Core Editor | 4/5 | In Progress|  |
| 3. Pages + Navigation | 1/2 | In Progress|  |
| 4. Todo + Kanban | 0/? | Not started | - |
| 5. Productivity Widgets | 0/5 | Planning complete | - |
| 6. UX + Polish | 0/2 | Planning complete | - |
