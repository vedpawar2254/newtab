# Phase 6: UX + Polish - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can navigate the entire app efficiently with a command palette (Cmd+K), search across all notes with full-text search, enter focus mode for distraction-free writing, and experience polished keyboard-driven interactions throughout. This phase depends on Phases 2 and 3 (editor and page hierarchy must exist). It does NOT add new features — it layers power-user UX on top of everything already built.

</domain>

<decisions>
## Implementation Decisions

### Command Palette (Cmd+K)
- Includes both page search and app commands (toggle sidebar, focus mode, new page, etc.) — two result groups
- Results grouped under category headers ("Pages", "Commands") — Notion/Linear-style
- Centered overlay dialog with backdrop dimming — VSCode/Notion style
- Shows recently accessed pages and frequently used commands before typing (recents section)
- Full keyboard navigation: arrow keys to navigate, Enter to select, Esc to dismiss, type to filter
- Uses cmdk library (already in stack)

### Full-Text Search
- Lives inside the command palette — no separate search UI
- Results show page title + highlighted text snippet showing match location
- Instant as-you-type results — FlexSearch is fast enough for this
- Indexes everything: titles, body text, todo items, code blocks, table content
- Uses FlexSearch library (already in stack) — builds in-memory inverted index on startup, updates incrementally on save

### Focus Mode
- Hides sidebar + all panels (todo panel, quotes) — only editor visible. Matches UX-03 requirement.
- Toggle via keyboard shortcut (Cmd+. or similar) + available as command in palette. No visible toggle button.
- Smooth transition: sidebar slides out, other panels fade out. ~250ms matching existing animation timing.
- Escape does NOT exit focus mode — only the toggle shortcut exits. Escape stays reserved for closing menus/deselecting.

### Keyboard Navigation
- Full keyboard nav on sidebar tree, command palette, and editor blocks
- Focus rings: 2px solid #5B9BD5 (blue accent) on focus-visible. Matches Phase 1 UI-SPEC.
- Region-based Tab order: sidebar → editor → panels. Within each region, arrow keys navigate items.
- Keyboard shortcuts displayed next to their commands in the palette — no separate cheat sheet view.

### Claude's Discretion
- Exact keyboard shortcut for focus mode (Cmd+. vs Cmd+Shift+F vs other)
- Command palette result item height and spacing
- FlexSearch index configuration (tokenization strategy, fuzzy matching threshold)
- Search result snippet length and highlight style
- Focus mode transition easing details
- Exact list of commands available in the palette
- Animation polish specifics across the app (UX-06)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` — Core value, constraints, key decisions
- `.planning/REQUIREMENTS.md` — UX-01 through UX-06 requirements for this phase
- `.planning/ROADMAP.md` — Phase 6 goal, success criteria, dependencies

### Prior phase context
- `.planning/phases/01-foundation-app-shell/01-CONTEXT.md` — Dark theme (warm grays, blue accent #5B9BD5, monospace typography), sidebar (240px, slide animation, Cmd+\ toggle), toast notifications, save status
- `.planning/phases/01-foundation-app-shell/01-UI-SPEC.md` — UI design contract with exact spacing, typography, color, animation timing values
- `.planning/phases/02-core-editor/02-CONTEXT.md` — Tiptap editor, floating toolbar, slash commands, markdown shortcuts
- `.planning/phases/03-pages-navigation/03-CONTEXT.md` — Sidebar tree with chevrons, drag-and-drop, inline rename, page lifecycle

### Research
- `.planning/research/STACK.md` — cmdk v1.0, FlexSearch v0.7, react-hotkeys-hook v5.0 — all already in recommended stack
- `.planning/research/SUMMARY.md` — Architecture approach, phase implications for Phase 6

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `hooks/useSidebarToggle.ts` — Keyboard shortcut hook for Cmd+\ sidebar toggle. Pattern can be extended for focus mode shortcut.
- `hooks/useToast.ts` — Toast context provider. Can show feedback for search actions.
- `components/layout/AppShell.tsx` — Main layout container. Focus mode will modify this to hide/show regions.
- `components/layout/Sidebar.tsx` — Sidebar component with slide animation. Focus mode hides this.
- `lib/stores/ui-store.ts` — Zustand UI state. Add focus mode state here.
- `lib/stores/notes-store.ts` — Notes store with tree index. Search indexes from this data.
- `lib/storage/storage-service.ts` — Storage service with save events. Search index updates on save.

### Established Patterns
- Zustand for state management — command palette state, focus mode state, search index should follow same pattern
- Tailwind CSS with dark theme tokens — all new UI components use these
- 250ms ease-in-out animations — match for focus mode transitions
- Blue accent #5B9BD5 for interactive elements — focus rings, palette highlights

### Integration Points
- AppShell layout — focus mode modifies visibility of sidebar and panel regions
- Sidebar component — keyboard navigation adds arrow key handling to tree items
- Editor — keyboard navigation coexists with editor's own key bindings
- Notes store — FlexSearch index built from notes data, updated on CRUD operations

</code_context>

<specifics>
## Specific Ideas

- Command palette should feel like Linear's — fast, clean, keyboard-first
- Search should feel instant — no perceptible delay between keystroke and results
- Focus mode should feel like a calm transition, not a jarring snap
- All keyboard shortcuts should have their binding shown in the palette so users learn them organically

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-ux-polish*
*Context gathered: 2026-03-19*
