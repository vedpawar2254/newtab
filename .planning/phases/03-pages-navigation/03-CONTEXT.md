# Phase 3: Pages + Navigation - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can organize notes into a nested page hierarchy with full sidebar navigation, drag-and-drop reordering, and page lifecycle management (create, rename, delete). This phase builds on the sidebar shell from Phase 1 and the editor from Phase 2. It does NOT include backlinks, search, trash/recovery, or pinned notes.

</domain>

<decisions>
## Implementation Decisions

### Tree Navigation UX
- Indentation + chevrons: each nesting level indents ~16px with a rotate-on-expand chevron arrow (Notion-style)
- Infinite nesting depth — no artificial limit (matches PAGE-02 requirement)
- Active page highlighted with subtle lighter background (#2f2f2f range) and blue accent left border
- Text-only tree — no icons or emoji on pages. Clean and minimal.
- Chevrons rotate smoothly on expand/collapse

### Page Creation Flow
- Persistent '+ New Page' button at the top of the sidebar, always visible
- Hover '+' icon appears on each page row to create a child page nested under that parent
- New pages named "Untitled" with title field immediately auto-focused for typing
- Creating a page navigates to it in the editor immediately

### Drag-and-Drop Behavior
- Drop indicators: blue horizontal line shows target position, dragging over a page's right half activates indent zone to nest as child
- Children move with parent — entire subtree relocates together
- Collapsed parents auto-expand after ~500ms hover during drag
- Drag handle (grip icon) appears on hover to the left of the page name — prevents accidental drags when clicking to navigate

### Page Lifecycle (Rename + Delete)
- Double-click page name in sidebar to rename inline (Enter to confirm, Escape to cancel)
- '...' (more) button appears on hover next to each page — menu includes Delete (room for future actions)
- Cascade delete: deleting a parent removes the entire subtree
- Confirmation dialog only when deleting a page with children ("Delete X and N child pages?")
- Deleting a leaf page happens instantly with no confirmation

### Claude's Discretion
- Drag-and-drop animation easing and timing details
- Exact hover delay before '+' and '...' buttons appear
- What page to navigate to after deleting the currently active page
- Tree expand/collapse animation duration
- Empty sidebar state (before any pages exist)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` — Core value, constraints, key decisions (Notion-comparable UX bar)
- `.planning/REQUIREMENTS.md` — PAGE-01 through PAGE-06 requirements for this phase
- `.planning/ROADMAP.md` — Phase 3 goal, success criteria, dependencies

### Prior phase context
- `.planning/phases/01-foundation-app-shell/01-CONTEXT.md` — Sidebar decisions (240px, slide animation, dark theme palette, Zustand stores, Dexie.js storage)

### Research
- `.planning/research/STACK.md` — Recommended stack (WXT, React, Dexie.js, Zustand, Tailwind)
- `.planning/research/SUMMARY.md` — Architecture approach, phase implications

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No code exists yet (greenfield). Phase 1 and 2 will create the foundation this phase builds on.

### Established Patterns (from Phase 1 context)
- Zustand stores for state management — page tree state should follow same pattern
- Dexie.js/IndexedDB with granular key-per-note + tree index — page hierarchy stored in tree index
- Tailwind CSS with dark theme tokens — reuse for all sidebar tree styling
- 200-300ms animations for sidebar transitions — drag-and-drop animations should match

### Integration Points
- Sidebar component from Phase 1 — tree navigation renders inside existing sidebar shell
- Storage Service from Phase 1 — page CRUD operations go through the storage abstraction
- Editor from Phase 2 — page selection triggers editor to load that page's content
- Tree index in Dexie.js — page hierarchy (parent-child relationships, ordering) stored here

</code_context>

<specifics>
## Specific Ideas

- Notion-style UX throughout: chevron expand/collapse, hover actions, inline rename, drag indicators
- The sidebar tree should feel snappy — instant response to clicks, smooth animations on expand/collapse and drag
- Text-only tree (no icons) keeps the sidebar clean and information-dense

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-pages-navigation*
*Context gathered: 2026-03-18*
