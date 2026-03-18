# Phase 5: Productivity Widgets - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Users get access to five self-contained productivity modules: a pomodoro timer, habit tracker, daily journal, motivational quotes, and a freeform whiteboard. All widgets live in the sidebar (except the whiteboard which opens full-page). This phase depends only on Phase 1 (Foundation + App Shell). It does NOT include todo panel (Phase 4), editor features (Phase 2), or page hierarchy (Phase 3).

</domain>

<decisions>
## Implementation Decisions

### Widget Placement & Access
- All widgets live as collapsible sections in the existing sidebar (below the page tree once Phase 3 is done)
- Pomodoro timer, habit tracker, and journal get their own sidebar sections
- Motivational quote sits at the very bottom of the sidebar as a subtle footer element
- All sidebar widget sections expanded by default on page load; users can collapse individually
- Whiteboard gets a sidebar button that opens Excalidraw full-width in the main content area (replacing the editor temporarily, like opening a special page)

### Pomodoro Timer
- Circular countdown display: animated ring/arc that depletes as time passes, with minutes:seconds in the center
- Start/pause/reset controls below the ring
- Configurable work/break durations (PROD-03)
- Completed session count displayed (PROD-02)
- Browser notification (chrome.notifications API) + audio chime when work/break session ends
- Timer continues running even if user navigates to another note or whiteboard

### Habit Tracker
- Simple checklist in sidebar: checkbox + habit name + streak count per habit
- Users can add, edit, and remove habits (PROD-06)
- Checkboxes reset at midnight local time
- Small row of dots (past 7 days) next to each habit showing recent history
- Streak count calculated from consecutive days of completion

### Daily Journal
- Journal entries are regular NoteRecords with a 'journal' type tag — stored in same Dexie notes table, editable in the full editor
- No auto-creation — a "Start today's journal" button appears in a Journal sidebar section. User clicks to create.
- New journal entry gets today's date as title (e.g., "March 19, 2026") and fixed reflection prompts pre-filled as content
- Fixed set of prompts every day: "What are you grateful for?", "What's your focus today?", "How are you feeling?"
- Journal sidebar section shows recent entries by date (last 7-10). Click to open in editor. Older entries accessible in the page tree under a "Journal" parent page.

### Motivational Quotes
- Quote displayed at the very bottom of the sidebar as a subtle, always-visible footer
- Rotates daily or on page refresh (QUOT-02)
- Built-in library of motivational quotes bundled with the extension (QUOT-03)
- No user customization of quotes in v1

### Whiteboard (Excalidraw)
- Library: Excalidraw (not tldraw)
- Full Excalidraw default toolset: shapes, lines, freehand, text, arrows, eraser, selection, etc.
- Single whiteboard canvas (not multiple whiteboards) — one persistent canvas
- Forced dark mode to match app theme — no theme toggle on canvas
- Whiteboard data persists in Dexie (DRAW-04) — likely stored as serialized Excalidraw scene in settings table
- Lazy-loaded: Excalidraw bundle does not load until user opens the whiteboard (DRAW-05)

### Claude's Discretion
- Exact sidebar section ordering (timer vs habits vs journal)
- Circular timer ring animation implementation details (SVG vs Canvas)
- Quote library size and curation
- Journal parent page auto-creation strategy
- Excalidraw bundle splitting and lazy-load approach
- Habit tracker dot visualization colors/sizing
- Audio chime file selection for pomodoro notification

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` -- Core value, constraints (dark theme only, <500ms load, Notion-comparable UX)
- `.planning/REQUIREMENTS.md` -- PROD-01 through PROD-09, QUOT-01 through QUOT-03, DRAW-01 through DRAW-05
- `.planning/ROADMAP.md` -- Phase 5 goal, success criteria, dependencies (Phase 1 only)

### Prior phase context
- `.planning/phases/01-foundation-app-shell/01-CONTEXT.md` -- Sidebar decisions (240px, slide animation), dark theme palette (warm grays, blue accent), storage UX (300ms debounce), Zustand stores, Tailwind styling
- `.planning/phases/02-core-editor/02-CONTEXT.md` -- Tiptap editor framework, NoteRecord JSON content format, floating toolbar
- `.planning/phases/03-pages-navigation/03-CONTEXT.md` -- Page tree navigation, sidebar tree structure, drag-and-drop patterns

### Research
- `.planning/research/STACK.md` -- Recommended stack, version compatibility
- `.planning/research/SUMMARY.md` -- Architecture approach, phase implications
- `.planning/research/PITFALLS.md` -- Storage pitfalls, lazy-load guidance

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/storage/storage-service.ts`: StorageService singleton with note CRUD, debounced saves, cache, and settings table access (for whiteboard data and widget state)
- `lib/storage/db.ts`: Dexie DB with `notes` and `settings` tables — widgets can store state in settings table (like tree-index pattern)
- `lib/stores/ui-store.ts`: Zustand UI store with sidebar state — extend for widget section collapse states
- `lib/stores/notes-store.ts`: Zustand notes store — journal entries can use existing note creation patterns
- `hooks/useToast.ts`: Toast notification system for error feedback
- `components/layout/Sidebar.tsx`: Existing sidebar component — widget sections render inside this
- `components/layout/AppShell.tsx`: Main layout — whiteboard renders in main content area
- `lib/utils/debounce.ts`: Reusable debounce utility

### Established Patterns
- Zustand stores for all state management — each widget should follow this pattern (e.g., usePomodoroStore, useHabitStore)
- StorageService as sole DB abstraction — no direct Dexie access from components
- Settings table for non-note data (key-value store) — use for habit data, timer state, whiteboard scene, quote rotation state
- NoteRecord for content that users edit — journal entries fit this model with a type tag
- Tailwind CSS with dark theme — all widget UI uses Tailwind classes
- 300ms debounce on writes

### Integration Points
- Sidebar component: widget sections added below existing sidebar content
- Main content area: whiteboard replaces editor view when opened
- StorageService: all persistence goes through this abstraction
- Dexie settings table: widget state stored as key-value pairs
- Dexie notes table: journal entries stored as NoteRecords with journal type tag
- chrome.notifications API: pomodoro timer end notifications

</code_context>

<specifics>
## Specific Ideas

- Pomodoro circular ring should feel satisfying to watch — smooth animation as it depletes
- Habit streak dots (7-day view) keep the habit tracker informative without taking too much sidebar space
- Journal "Start today's journal" button makes it intentional rather than auto-creating entries the user might never write
- Whiteboard should feel like opening an Excalidraw instance — full power, not a toy subset
- Quote at sidebar bottom should be subtle, not attention-grabbing — it's ambient motivation

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 05-productivity-widgets*
*Context gathered: 2026-03-19*
