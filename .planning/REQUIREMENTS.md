# Requirements: NewTab

**Defined:** 2026-03-19
**Core Value:** The editor and note-taking experience must feel as powerful and polished as Notion — rich text with markdown shortcuts, nested pages, and seamless organization.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [ ] **FOUND-01**: Extension loads new tab page in under 500ms to interactive
- [ ] **FOUND-02**: All data persists in local storage (Dexie.js/IndexedDB) until user deletes it
- [ ] **FOUND-03**: Storage uses granular key-per-note architecture with tree index
- [ ] **FOUND-04**: Dark theme applied globally as the only theme
- [ ] **FOUND-05**: Extension uses Chrome Manifest V3 with `unlimitedStorage` permission
- [ ] **FOUND-06**: UI animations and transitions feel smooth and premium (Notion-comparable)

### Editor

- [ ] **EDIT-01**: User can create and edit notes with rich text formatting (bold, italic, underline, strikethrough)
- [ ] **EDIT-02**: User can type markdown shortcuts that auto-convert (# heading, **bold**, - list, etc.)
- [ ] **EDIT-03**: User can create headings (H1, H2, H3) via toolbar or markdown shortcuts
- [ ] **EDIT-04**: User can create ordered and unordered lists
- [ ] **EDIT-05**: User can create checkbox/todo items inside any note
- [ ] **EDIT-06**: User can insert syntax-highlighted code blocks with language selector
- [ ] **EDIT-07**: User can create and edit inline tables (add/remove rows and columns)
- [ ] **EDIT-08**: User can embed images inline in notes
- [ ] **EDIT-09**: User can embed links with preview cards
- [ ] **EDIT-10**: User can drag and reorder blocks within a note
- [ ] **EDIT-11**: User can use slash command menu to insert any block type
- [ ] **EDIT-12**: Editor supports keyboard shortcuts for all common formatting actions

### Pages

- [ ] **PAGE-01**: User can create new pages/notes from sidebar
- [ ] **PAGE-02**: User can nest any page inside another page (infinite depth)
- [ ] **PAGE-03**: User can see page hierarchy in collapsible sidebar tree
- [ ] **PAGE-04**: User can rename pages inline
- [ ] **PAGE-05**: User can delete pages
- [ ] **PAGE-06**: User can reorder pages via drag-and-drop in sidebar
- [ ] **PAGE-07**: Notes-first layout with full editor center stage and sidebar for navigation

### Todo

- [ ] **TODO-01**: User can see a dedicated todo panel on the new tab page
- [ ] **TODO-02**: User can add, edit, complete, and delete todos from the panel
- [ ] **TODO-03**: User can mark todos as complete with checkbox toggle
- [ ] **TODO-04**: Todo panel persists state across tab opens
- [ ] **TODO-05**: User can reorder todos via drag-and-drop

### Kanban

- [ ] **KANB-01**: User can view todos/tasks in a kanban board layout
- [ ] **KANB-02**: User can create kanban columns (e.g., To Do, In Progress, Done)
- [ ] **KANB-03**: User can drag cards between columns
- [ ] **KANB-04**: User can add, edit, and delete kanban cards
- [ ] **KANB-05**: Kanban state persists across tab opens

### Whiteboard

- [ ] **DRAW-01**: User can open a whiteboard canvas for freeform drawing
- [ ] **DRAW-02**: User can draw shapes, lines, and freehand on the canvas
- [ ] **DRAW-03**: User can add text to the whiteboard
- [ ] **DRAW-04**: Whiteboard data persists across tab opens
- [ ] **DRAW-05**: Whiteboard loads lazily (does not impact initial page load)

### Productivity

- [ ] **PROD-01**: User can see a Pomodoro timer with start/pause/reset controls
- [ ] **PROD-02**: Pomodoro timer tracks completed sessions
- [ ] **PROD-03**: User can configure Pomodoro durations (work/break intervals)
- [ ] **PROD-04**: User can track daily habits with checkboxes
- [ ] **PROD-05**: Habit tracker shows streak count for each habit
- [ ] **PROD-06**: User can add, edit, and remove habits
- [ ] **PROD-07**: Daily journal auto-creates a dated note each day
- [ ] **PROD-08**: Daily journal includes reflection prompts
- [ ] **PROD-09**: User can access past journal entries

### Quotes

- [ ] **QUOT-01**: User can see a motivational quote in a corner of the page
- [ ] **QUOT-02**: Quotes rotate daily or on page refresh
- [ ] **QUOT-03**: Extension includes a built-in library of motivational quotes

### UX

- [ ] **UX-01**: User can open command palette with Cmd+K (or Ctrl+K)
- [ ] **UX-02**: Command palette supports searching notes, commands, and navigation
- [ ] **UX-03**: User can toggle focus mode (hides sidebar, todo panel, quotes — only editor visible)
- [ ] **UX-04**: User can search across all notes with full-text search
- [ ] **UX-05**: Full keyboard navigation across the app
- [ ] **UX-06**: All interactions feel smooth with appropriate animations and transitions

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Navigation

- **NAV-01**: [[Backlinks]] — wiki-style links between notes with reverse references
- **NAV-02**: Pinned notes — pin important notes to always show at top of sidebar

### Capture

- **CAPT-01**: Quick capture — global keyboard shortcut to jot a thought from any tab
- **CAPT-02**: Bookmarks manager — save and organize frequently used links

### Data Management

- **DATA-01**: Trash/recovery — deleted notes go to trash, recoverable for 30 days
- **DATA-02**: Export notes as Markdown files
- **DATA-03**: Export notes as PDF
- **DATA-04**: Import notes from Markdown files

### Theming

- **THEME-01**: Light theme option
- **THEME-02**: Custom accent colors

## Out of Scope

| Feature | Reason |
|---------|--------|
| Cloud sync / accounts | Local-only for v1, no backend complexity |
| Multi-device sync | Single browser, single machine |
| Real-time collaboration | Single user product |
| AI/LLM writing assistance | Out of scope, adds complexity and API dependency |
| OAuth / authentication | No accounts needed for local-only |
| Mobile app | Chrome extension only |
| Graph visualization | Too complex for v1; backlinks deferred to v2 |
| Widget marketplace | Over-engineering for v1 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Pending |
| FOUND-02 | Phase 1 | Pending |
| FOUND-03 | Phase 1 | Pending |
| FOUND-04 | Phase 1 | Pending |
| FOUND-05 | Phase 1 | Pending |
| FOUND-06 | Phase 1 | Pending |
| EDIT-01 | Phase 2 | Pending |
| EDIT-02 | Phase 2 | Pending |
| EDIT-03 | Phase 2 | Pending |
| EDIT-04 | Phase 2 | Pending |
| EDIT-05 | Phase 2 | Pending |
| EDIT-06 | Phase 2 | Pending |
| EDIT-07 | Phase 2 | Pending |
| EDIT-08 | Phase 2 | Pending |
| EDIT-09 | Phase 2 | Pending |
| EDIT-10 | Phase 2 | Pending |
| EDIT-11 | Phase 2 | Pending |
| EDIT-12 | Phase 2 | Pending |
| PAGE-01 | Phase 3 | Pending |
| PAGE-02 | Phase 3 | Pending |
| PAGE-03 | Phase 3 | Pending |
| PAGE-04 | Phase 3 | Pending |
| PAGE-05 | Phase 3 | Pending |
| PAGE-06 | Phase 3 | Pending |
| PAGE-07 | Phase 1 | Pending |
| TODO-01 | Phase 4 | Pending |
| TODO-02 | Phase 4 | Pending |
| TODO-03 | Phase 4 | Pending |
| TODO-04 | Phase 4 | Pending |
| TODO-05 | Phase 4 | Pending |
| KANB-01 | Phase 4 | Pending |
| KANB-02 | Phase 4 | Pending |
| KANB-03 | Phase 4 | Pending |
| KANB-04 | Phase 4 | Pending |
| KANB-05 | Phase 4 | Pending |
| DRAW-01 | Phase 5 | Pending |
| DRAW-02 | Phase 5 | Pending |
| DRAW-03 | Phase 5 | Pending |
| DRAW-04 | Phase 5 | Pending |
| DRAW-05 | Phase 5 | Pending |
| PROD-01 | Phase 5 | Pending |
| PROD-02 | Phase 5 | Pending |
| PROD-03 | Phase 5 | Pending |
| PROD-04 | Phase 5 | Pending |
| PROD-05 | Phase 5 | Pending |
| PROD-06 | Phase 5 | Pending |
| PROD-07 | Phase 5 | Pending |
| PROD-08 | Phase 5 | Pending |
| PROD-09 | Phase 5 | Pending |
| QUOT-01 | Phase 5 | Pending |
| QUOT-02 | Phase 5 | Pending |
| QUOT-03 | Phase 5 | Pending |
| UX-01 | Phase 6 | Pending |
| UX-02 | Phase 6 | Pending |
| UX-03 | Phase 6 | Pending |
| UX-04 | Phase 6 | Pending |
| UX-05 | Phase 6 | Pending |
| UX-06 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 58 total
- Mapped to phases: 58
- Unmapped: 0

---
*Requirements defined: 2026-03-19*
*Last updated: 2026-03-19 after roadmap creation*
