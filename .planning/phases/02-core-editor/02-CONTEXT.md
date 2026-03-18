# Phase 2: Core Editor - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

A Notion-quality block editor where users create and edit notes with rich text formatting, markdown shortcuts, code blocks, tables, image embeds, link bookmark cards, slash commands, and block drag-and-drop. Content auto-saves to the Dexie.js/IndexedDB storage layer from Phase 1. This phase delivers the entire editing experience -- no page hierarchy (Phase 3), no todo panel (Phase 4).

</domain>

<decisions>
## Implementation Decisions

### Editor Framework
- Tiptap (built on ProseMirror) as the editor framework -- headless, rich extension ecosystem
- Content stored as Tiptap JSON document format (native ProseMirror JSON)
- Markdown shortcuts convert instantly on typing (Notion-style) -- type `# ` and it becomes H1 immediately, `**text**` converts to bold in place
- Hover drag handles on blocks -- a grip icon appears on the left when hovering, drag to reorder

### Slash Command Menu
- Inline floating dropdown appears at cursor position when user types `/`
- Block types grouped with category headers (Text, Lists, Media, etc.)
- Each item shows an icon + label for fast visual scanning
- Full keyboard navigation: arrow keys to navigate, Enter to select, Esc to dismiss, type to filter

### Tables
- Inline grid editing -- click any cell to edit, Tab to move between cells
- Add rows/columns via + buttons on table edges
- Notion-style mini spreadsheet feel

### Code Blocks
- Language selector dropdown at the top of each code block
- Syntax highlighting via lightweight library (highlight.js or Shiki)
- Copy button appears on hover

### Images
- Support all three input methods: paste from clipboard, drag-and-drop file, enter URL
- Images stored as base64 in IndexedDB (local-only, no server needed)

### Link Embeds
- Pasted URLs render as bookmark cards with title, description, and favicon (fetched via metadata)
- Falls back to plain URL if metadata unavailable

### Toolbar & Formatting
- Floating bubble toolbar appears above selected text, disappears when nothing selected
- Core formatting set: Bold, Italic, Underline, Strikethrough, Code, Link, Heading dropdown (H1/H2/H3)
- No text color or highlight color in v1

### Note Title & Empty State
- Dedicated title field at top of each note (separate from body) -- doubles as page name in sidebar
- Placeholder text in empty state: light gray "Type / for commands..." in body, "Untitled" in title field

### Claude's Discretion
- Exact Tiptap extensions and plugin choices
- Syntax highlighting library choice (highlight.js vs Shiki vs other)
- Bookmark card metadata fetching approach (given Chrome extension context)
- Drag handle icon design and positioning details
- Slash menu animation and styling details
- Table resize behavior and min/max column widths
- Image resize controls (if any)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` -- Core value ("editor must feel as powerful as Notion"), constraints, key decisions
- `.planning/REQUIREMENTS.md` -- EDIT-01 through EDIT-12 requirements for this phase
- `.planning/ROADMAP.md` -- Phase 2 goal, success criteria, dependencies

### Phase 1 context
- `.planning/phases/01-foundation-app-shell/01-CONTEXT.md` -- Dark theme decisions (warm grays, blue accent, monospace typography, flat surfaces), storage UX (300ms debounce auto-save), Zustand state management, Tailwind styling

### Research
- `.planning/research/STACK.md` -- Recommended stack, version compatibility
- `.planning/research/SUMMARY.md` -- Architecture approach, critical pitfalls

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No source code exists yet -- Phase 1 has not been implemented. Phase 2 will build on whatever Phase 1 creates.

### Established Patterns (from Phase 1 decisions)
- Zustand for state management -- editor state should follow same pattern
- Tailwind CSS for styling -- editor components use Tailwind classes
- Dexie.js/IndexedDB for persistence -- editor content saves through the storage service
- Dark theme tokens (warm grays #191919-#2f2f2f, blue accent #5b9bd5) -- editor inherits these
- Monospace-first typography (JetBrains Mono or system monospace)

### Integration Points
- Storage Service from Phase 1 -- editor auto-saves Tiptap JSON through this abstraction
- Shell layout from Phase 1 -- editor renders in the main content area
- Sidebar from Phase 1 -- note title syncs with sidebar display (Phase 3 adds full navigation)

</code_context>

<specifics>
## Specific Ideas

- Notion-comparable quality bar -- the editor IS the core value proposition, it must feel premium
- Markdown shortcuts should feel instant -- no visible delay between typing syntax and seeing formatted result
- Slash menu should feel like part of the writing flow, not a separate UI mode
- Tables should feel like a mini spreadsheet, not a clunky HTML table

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 02-core-editor*
*Context gathered: 2026-03-18*
