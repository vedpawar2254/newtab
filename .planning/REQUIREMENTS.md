# Requirements: NewTab

**Defined:** 2026-03-19
**Core Value:** The editor and note-taking experience must feel as powerful and polished as Notion — rich text with markdown shortcuts, nested pages, and seamless organization.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [x] **FOUND-01**: Extension loads new tab page in under 500ms to interactive
- [x] **FOUND-02**: All data persists in local storage (Dexie.js/IndexedDB) until user deletes it
- [x] **FOUND-03**: Storage uses granular key-per-note architecture with tree index
- [x] **FOUND-04**: Dark theme applied globally as the only theme
- [x] **FOUND-05**: Extension uses Chrome Manifest V3 with `unlimitedStorage` permission
- [x] **FOUND-06**: UI animations and transitions feel smooth and premium (Notion-comparable)

### Editor

- [x] **EDIT-01**: User can create and edit notes with rich text formatting (bold, italic, underline, strikethrough)
- [x] **EDIT-02**: User can type markdown shortcuts that auto-convert (# heading, **bold**, - list, etc.)
- [x] **EDIT-03**: User can create headings (H1, H2, H3) via toolbar or markdown shortcuts
- [x] **EDIT-04**: User can create ordered and unordered lists
- [x] **EDIT-05**: User can create checkbox/todo items inside any note
- [x] **EDIT-06**: User can insert syntax-highlighted code blocks with language selector
- [x] **EDIT-07**: User can create and edit inline tables (add/remove rows and columns)
- [x] **EDIT-08**: User can embed images inline in notes
- [x] **EDIT-09**: User can embed links with preview cards
- [x] **EDIT-10**: User can drag and reorder blocks within a note
- [x] **EDIT-11**: User can use slash command menu to insert any block type
- [x] **EDIT-12**: Editor supports keyboard shortcuts for all common formatting actions

### Pages

- [x] **PAGE-01**: User can create new pages/notes from sidebar
- [x] **PAGE-02**: User can nest any page inside another page (infinite depth)
- [x] **PAGE-03**: User can see page hierarchy in collapsible sidebar tree
- [x] **PAGE-04**: User can rename pages inline
- [x] **PAGE-05**: User can delete pages
- [x] **PAGE-06**: User can reorder pages via drag-and-drop in sidebar
- [x] **PAGE-07**: Notes-first layout with full editor center stage and sidebar for navigation

### Todo

- [ ] **TODO-01**: User can see a dedicated todo panel on the new tab page
- [x] **TODO-02**: User can add, edit, complete, and delete todos from the panel
- [x] **TODO-03**: User can mark todos as complete with checkbox toggle
- [x] **TODO-04**: Todo panel persists state across tab opens
- [ ] **TODO-05**: User can reorder todos via drag-and-drop

### Kanban

- [ ] **KANB-01**: User can view todos/tasks in a kanban board layout
- [x] **KANB-02**: User can create kanban columns (e.g., To Do, In Progress, Done)
- [ ] **KANB-03**: User can drag cards between columns
- [x] **KANB-04**: User can add, edit, and delete kanban cards
- [x] **KANB-05**: Kanban state persists across tab opens

### Whiteboard

- [x] **DRAW-01**: User can open a whiteboard canvas for freeform drawing
- [x] **DRAW-02**: User can draw shapes, lines, and freehand on the canvas
- [x] **DRAW-03**: User can add text to the whiteboard
- [x] **DRAW-04**: Whiteboard data persists across tab opens
- [x] **DRAW-05**: Whiteboard loads lazily (does not impact initial page load)

### Productivity

- [x] **PROD-01**: User can see a Pomodoro timer with start/pause/reset controls
- [x] **PROD-02**: Pomodoro timer tracks completed sessions
- [x] **PROD-03**: User can configure Pomodoro durations (work/break intervals)
- [x] **PROD-04**: User can track daily habits with checkboxes
- [x] **PROD-05**: Habit tracker shows streak count for each habit
- [x] **PROD-06**: User can add, edit, and remove habits
- [x] **PROD-07**: Daily journal auto-creates a dated note each day
- [x] **PROD-08**: Daily journal includes reflection prompts
- [x] **PROD-09**: User can access past journal entries

### Quotes

- [x] **QUOT-01**: User can see a motivational quote in a corner of the page
- [x] **QUOT-02**: Quotes rotate daily or on page refresh
- [x] **QUOT-03**: Extension includes a built-in library of motivational quotes

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
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| FOUND-03 | Phase 1 | Complete |
| FOUND-04 | Phase 1 | Complete |
| FOUND-05 | Phase 1 | Complete |
| FOUND-06 | Phase 1 | Complete |
| EDIT-01 | Phase 2 | Complete |
| EDIT-02 | Phase 2 | Complete |
| EDIT-03 | Phase 2 | Complete |
| EDIT-04 | Phase 2 | Complete |
| EDIT-05 | Phase 2 | Complete |
| EDIT-06 | Phase 2 | Complete |
| EDIT-07 | Phase 2 | Complete |
| EDIT-08 | Phase 2 | Complete |
| EDIT-09 | Phase 2 | Complete |
| EDIT-10 | Phase 2 | Complete |
| EDIT-11 | Phase 2 | Complete |
| EDIT-12 | Phase 2 | Complete |
| PAGE-01 | Phase 3 | Complete |
| PAGE-02 | Phase 3 | Complete |
| PAGE-03 | Phase 3 | Complete |
| PAGE-04 | Phase 3 | Complete |
| PAGE-05 | Phase 3 | Complete |
| PAGE-06 | Phase 3 | Complete |
| PAGE-07 | Phase 1 | Complete |
| TODO-01 | Phase 4 | Pending |
| TODO-02 | Phase 4 | Complete |
| TODO-03 | Phase 4 | Complete |
| TODO-04 | Phase 4 | Complete |
| TODO-05 | Phase 4 | Pending |
| KANB-01 | Phase 4 | Pending |
| KANB-02 | Phase 4 | Complete |
| KANB-03 | Phase 4 | Pending |
| KANB-04 | Phase 4 | Complete |
| KANB-05 | Phase 4 | Complete |
| DRAW-01 | Phase 5 | Complete |
| DRAW-02 | Phase 5 | Complete |
| DRAW-03 | Phase 5 | Complete |
| DRAW-04 | Phase 5 | Complete |
| DRAW-05 | Phase 5 | Complete |
| PROD-01 | Phase 5 | Complete |
| PROD-02 | Phase 5 | Complete |
| PROD-03 | Phase 5 | Complete |
| PROD-04 | Phase 5 | Complete |
| PROD-05 | Phase 5 | Complete |
| PROD-06 | Phase 5 | Complete |
| PROD-07 | Phase 5 | Complete |
| PROD-08 | Phase 5 | Complete |
| PROD-09 | Phase 5 | Complete |
| QUOT-01 | Phase 5 | Complete |
| QUOT-02 | Phase 5 | Complete |
| QUOT-03 | Phase 5 | Complete |
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
