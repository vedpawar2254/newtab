# NewTab — Notion-Level New Tab Productivity Hub

## What This Is

A Chrome extension that replaces the new tab page with a full-featured, Notion-comparable productivity workspace. Users get a dark-themed, notes-first environment with a rich text editor, nested pages, linked notes, todos, kanban boards, whiteboard, habit tracking, pomodoro timer, daily journal, bookmarks, and motivational quotes — all persisting locally until explicitly deleted.

## Core Value

The editor and note-taking experience must feel as powerful and polished as Notion — rich text with markdown shortcuts, nested pages, and seamless organization. If the editor doesn't feel great, nothing else matters.

## Requirements

### Validated

- [x] Nested pages — any note can contain sub-notes, infinite depth (Validated in Phase 3: Pages + Navigation)
- [x] Notes-first layout — full editor center stage, sidebar for navigation (Validated in Phase 1: Foundation + App Shell)
- [x] Dark theme (mandatory, default and only theme for v1) (Validated in Phase 1: Foundation + App Shell)
- [x] Local-only persistence via Chrome storage APIs (Validated in Phase 1: Foundation + App Shell)

### Active

- [ ] Rich text editor with markdown shortcuts (WYSIWYG + MD)
- [ ] Nested pages — any note can contain sub-notes, infinite depth
- [ ] Wiki-style backlinks — [[link]] between notes, see connections
- [ ] Dedicated todo panel on new tab page (always visible in sidebar)
- [ ] Checkbox blocks embeddable inside any note
- [ ] Kanban board view for todos/notes
- [ ] Code blocks with syntax highlighting and language selector
- [ ] Inline tables (create and edit)
- [ ] Image/link/bookmark embeds
- [ ] Whiteboard — freeform drawing canvas for sketches and diagrams
- [ ] Pomodoro timer with session tracking
- [ ] Habit tracker with daily streaks
- [ ] Daily journal — auto-created daily note with date and prompts
- [ ] Bookmarks/links manager — save and organize frequently used links
- [ ] Motivational quotes corner — built-in library, rotates daily/on refresh
- [ ] Quick capture — global keyboard shortcut to jot a thought instantly
- [ ] Focus mode — distraction-free writing, hides everything except editor
- [ ] Pinned notes — pin important notes to always show on dashboard
- [ ] Command palette (Cmd+K) with full keyboard navigation
- [ ] Trash/recovery — deleted notes recoverable for 30 days
- [ ] Search across all notes (basic full-text)
- [ ] Dark theme (mandatory, default and only theme for v1)
- [ ] Local-only persistence via Chrome storage APIs
- [ ] Import/Export — export as Markdown/PDF, import from other tools
- [ ] Notes-first layout — full editor center stage, sidebar for navigation

### Out of Scope

- Cloud sync / accounts — local-only for v1, no backend
- Multi-device sync — single browser instance
- Light theme — dark only for v1
- Mobile app — Chrome extension only
- Real-time collaboration — single user
- AI/LLM features — no AI writing assistance in v1
- OAuth / authentication — no accounts needed

## Context

- Chrome extension using Manifest V3
- New tab override (`chrome_url_override.newtab`)
- All data stored in `chrome.storage.local` (up to ~10MB, unlimited with `unlimitedStorage` permission)
- The UI/UX quality bar is Notion — clean, fluid, intuitive interactions
- User plans to run 3 Claude Code instances in parallel, each working on different phases
- Rich text editor likely needs a framework (Tiptap, ProseMirror, or similar)
- Whiteboard likely needs a canvas library (Excalidraw, tldraw, or similar)

## Constraints

- **Platform**: Chrome extension (Manifest V3) — no server, no backend
- **Storage**: chrome.storage.local only — must handle storage limits gracefully
- **Theme**: Dark theme only — no theme switching in v1
- **UX Bar**: Notion-comparable — animations, transitions, keyboard shortcuts must feel premium
- **Performance**: New tab must load fast (<500ms to interactive) — it opens on every new tab

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Rich text + MD shortcuts over pure markdown editor | Best of both worlds — users type naturally, MD shortcuts for power users | — Pending |
| Notion-style nested pages over folders | More flexible, matches mental model of hierarchical thinking | — Pending |
| Local-only storage over cloud sync | Simplicity, no backend, no accounts — ship faster | — Pending |
| Dark theme only for v1 | User preference, reduces scope, consistent aesthetic | — Pending |
| Notes-first layout over dashboard | Editor is the core value, should be front and center | — Pending |
| Wiki-style backlinks over visual mind maps | More practical for daily use, lower complexity than full graph view | — Pending |

---
*Last updated: 2026-03-18 after Phase 3 completion*
