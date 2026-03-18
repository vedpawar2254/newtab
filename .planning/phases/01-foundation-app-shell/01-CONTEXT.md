# Phase 1: Foundation + App Shell - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

A working Chrome extension (Manifest V3) that replaces the new tab page, loads in under 500ms, persists data reliably with granular key-per-note storage (Dexie.js/IndexedDB), and renders a dark-themed notes-first shell with collapsible sidebar. This phase builds the scaffold everything else depends on — no editor, no pages, no features yet.

</domain>

<decisions>
## Implementation Decisions

### Dark Theme Design
- Warm dark grays (Notion-dark tone) — background range #191919-#2f2f2f
- Blue accent color (#5b9bd5 range) for interactive elements, links, active states
- Monospace-first typography (JetBrains Mono or system monospace) for all UI and future editor
- Subtle 1px borders with slight opacity, flat surfaces — no shadows or elevation
- Consistent dark palette across all surfaces — sidebar, main content, header, toasts

### Sidebar + Shell Layout
- Sidebar slides in/out pushing main content (200-300ms animation, Notion-style)
- Default sidebar width: 240px
- Sidebar open by default on new tab
- Main content area placeholder: Claude's Discretion (sensible default before editor exists)

### Save/Status Feedback
- Subtle "Saved" status text that appears briefly after auto-save, then fades (Notion-style)
- Skeleton UI for initial shell render — animated skeleton placeholders for sidebar and content while data loads
- Toast notifications for errors — non-blocking, bottom-right, auto-dismiss after a few seconds

### Storage UX
- Auto-save with 300ms debounce after user stops typing
- Warning toast at 80% storage capacity
- Phase 1 builds storage abstraction and API only — no user-facing data management UI

### Claude's Discretion
- Main content area placeholder/empty state design (before editor exists in Phase 2)
- Exact monospace font choice (JetBrains Mono vs Fira Code vs system monospace)
- Skeleton UI animation details (pulse vs shimmer)
- Toast notification positioning and timing specifics
- Exact color values within the warm dark gray + blue accent palette

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` — Core value, constraints, key decisions
- `.planning/REQUIREMENTS.md` — FOUND-01 through FOUND-06, PAGE-07 requirements for this phase
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, dependencies

### Research
- `.planning/research/STACK.md` — Recommended stack (WXT, React, Dexie.js, Zustand, Tailwind), installation commands, version compatibility
- `.planning/research/SUMMARY.md` — Architecture approach, critical pitfalls, phase implications
- `.planning/research/PITFALLS.md` — Storage blob pitfall, editor blocking first paint, data loss risks

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No existing code — greenfield project. Phase 1 creates the foundation.

### Established Patterns
- No patterns established yet. This phase sets the conventions for all subsequent phases.

### Integration Points
- WXT scaffold will define the project structure (src/, entrypoints/, public/)
- Storage Service abstraction will be the integration point for all future features
- Zustand stores will be the state management pattern for all subsequent phases
- Tailwind dark theme tokens will be reused across all components

</code_context>

<specifics>
## Specific Ideas

- Notion-comparable quality bar for UI polish — animations, transitions, and interactions must feel premium
- The <500ms load target is critical because new tab opens constantly — sluggishness triggers immediate abandonment
- Storage architecture must use granular key-per-note from day one (research pitfall #1 — cannot be migrated cheaply after user data exists)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-app-shell*
*Context gathered: 2026-03-19*
