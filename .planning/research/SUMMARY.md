# Project Research Summary

**Project:** Chrome Extension — Notion-level New Tab Productivity Workspace
**Domain:** Browser extension / local-first note-taking application
**Researched:** 2026-03-19
**Confidence:** HIGH

## Executive Summary

This project is a Chrome extension that overrides the new tab page with a Notion-depth block editor, nested pages, and productivity widgets — all local-first with no backend. The core market insight is sharp: existing new tab extensions (Momentum, New Tab Notes) are visually polished but editorially shallow, while powerful note apps (Notion, Obsidian) don't live in the browser's new tab. No current product occupies this intersection. The recommended approach is to build on WXT (the leading 2025-2026 extension framework) with BlockNote as the editor foundation, Dexie.js for structured IndexedDB storage, and Zustand for state management. This stack is purpose-built for the constraints of a Chrome MV3 extension and eliminates major classes of incidental complexity.

The build order is strictly dependency-driven: storage abstraction and app shell come first because everything else depends on reliable persistence. The core editor must be production-quality before adding organizational or productivity features — a mediocre editor invalidates the entire value proposition. Phase gating is essential; every listed feature sounds necessary but the project will fail to ship if kanban boards are built before the basic editor is polished. The PITFALLS research is unusually strong and should be treated as hard constraints, not suggestions: granular storage keying, debounced writes, and lazy-loading heavy dependencies (tldraw, editor extensions) are non-negotiable from Phase 1.

The primary risks are technical debt in the storage layer (a single giant JSON blob will collapse performance at 50+ notes), editor first-paint blocking (ProseMirror initialization can cause visible blank-page flicker on every new tab), and scope creep causing a failure to ship. All three are preventable if addressed in Phase 1. Secondary risks include ProseMirror schema mismatches silently dropping content during upgrades (mitigated by schema versioning from day one) and CSP-blocked dependencies discovered only after integration (mitigated by developing and testing inside the actual extension context from the start).

## Key Findings

### Recommended Stack

The stack is dominated by the BlockNote/Tiptap/ProseMirror editor chain and the WXT extension framework. BlockNote v0.47 (built on Tiptap v3 / ProseMirror) delivers Notion-style block editing — slash menus, drag-and-drop blocks, markdown shortcuts — without requiring a team to build every editor UI element from scratch. This is the correct abstraction level for "Notion-comparable quality" by a small team. WXT v0.20 wraps Vite 6 and provides manifest generation, HMR, and cross-browser support; it replaces CRXJS, which is at archival risk. Storage is split: `chrome.storage.local` for small metadata and settings, Dexie.js (IndexedDB) for note content and large data. Zustand v5 handles global state at 3KB bundle cost.

**Core technologies:**
- **WXT v0.20**: Chrome extension framework — manages manifest, HMR, TypeScript, cross-browser compat on top of Vite 6
- **React v19 + TypeScript v5.7**: UI layer + type safety — required by BlockNote, tldraw, cmdk; non-negotiable for this library ecosystem
- **BlockNote v0.47**: Block editor — Notion-style UX (slash commands, drag blocks, markdown shortcuts) built on Tiptap v3/ProseMirror; faster to ship than raw Tiptap
- **tldraw v4.3**: Whiteboard/canvas — SDK-first React component model, superior customization vs. Excalidraw; must be lazy-loaded
- **Dexie.js v4.0**: IndexedDB wrapper — structured queries, schema versioning, bulk operations; far superior to `chrome.storage.local` for note content
- **Zustand v5.0**: State management — 3KB, zero boilerplate, works outside React (useful for extension messaging)
- **Tailwind CSS v4.0**: Styling — CSS-first config, consistent design tokens, ideal for dark-theme-only UI
- **FlexSearch v0.7**: Full-text search — 1000x faster than Fuse.js for 1000+ notes; builds in-memory inverted index
- **cmdk v1.0**: Command palette — headless, accessible, pairs with Tailwind

### Expected Features

The competitive gap is real and exploitable. No existing product is both embedded in the new tab AND provides Notion-depth editing. The MVP must prove the editor is "Notion-level" — everything else is layered on after that proof.

**Must have (table stakes):**
- Rich text editor with block-based formatting (headings, lists, bold/italic, blockquote) — users won't adopt plain text
- Markdown shortcuts (`**bold**`, `# heading`, `- list`) — power users expect Notion/Obsidian parity
- Auto-save with debounced writes — note loss destroys trust instantly
- Fast startup (<500ms to interactive) — new tab opens constantly; sluggishness triggers immediate abandonment
- Dark theme (only) — spec mandate and developer/power-user default preference
- Sidebar navigation — collapsible, nested page tree; all serious note apps have this
- Full-text search — notes become a graveyard without it
- Trash/recovery (30-day soft delete) — accidental deletion anxiety is a real adoption barrier
- Keyboard shortcuts (Cmd+B/I/K) — Tiptap provides these; just configure and document
- Todo checkboxes embedded in notes — #1 expected widget in productivity new tab extensions
- Code blocks with syntax highlighting — essential for the developer audience

**Should have (differentiators, v1.x):**
- Nested pages (infinite depth) — no new tab extension has this; immediate differentiation from flat-list competitors
- Wiki-style backlinks (`[[link]]`) — Obsidian's killer feature, absent from all new tab extensions
- Command palette (Cmd+K) — power-user accelerator; force multiplier for navigation
- Daily journal (auto-created daily note) — drives retention and journaling habit
- Quick capture (global shortcut via `chrome.commands`) — extension-native; capture from any tab
- Kanban board view for todos — once todo usage patterns are understood
- Focus mode (hide sidebar/toolbar) — low effort, high perceived value for writers
- Export (Markdown) — escape hatch; reduces lock-in fear
- Image/link embeds — enriches editor; add after core text editing is stable
- Inline tables — complex Tiptap extension; add after editor stability is proven

**Defer (v2+):**
- Whiteboard/canvas (tldraw) — very high complexity; no other feature depends on it
- Pomodoro timer and habit tracker — independent widgets; add for retention after core is proven
- Motivational quotes, bookmarks manager — polish and auxiliary features
- Cloud sync / collaboration — requires backend, CRDT, auth; architecturally incompatible with local-first v1
- AI writing assistant — distracts from editor quality; add opt-in with user's API key if at all
- Full Notion-style database views — Notion spent years building this with a large team; offer kanban only

### Architecture Approach

The architecture is a three-layer React extension: a presentation layer (App Shell, Sidebar, Editor, Feature Panels), a state layer (Zustand stores for notes, pages tree, UI state, features), and a persistence layer (Storage Service abstraction over `chrome.storage.local` + IndexedDB). The critical design constraint is the Storage Service — every store goes through it, never calling Chrome APIs directly. This enables write-through caching (reads are instant from memory), debounced saves (300ms), error handling, and future storage backend swaps. The page tree is stored as a flat list with `parentId` references and a lightweight index object (IDs, titles, parent refs, path arrays) — never as a nested JSON tree. Note content is stored under individual keys (`note:{id}`) separate from metadata, enabling on-demand loading without reading the full dataset. Feature modules are self-contained (component + store slice + types), enabling parallel development and clean code splitting.

**Major components:**
1. **App Shell + Router** — layout scaffold, keyboard shortcut registry, command palette host
2. **Sidebar** — recursive page tree, pinned notes, search trigger, drag-and-drop reordering
3. **Editor (BlockNote/Tiptap)** — core product; block types, slash commands, markdown shortcuts, extensions for backlinks/tables/embeds
4. **Storage Service** — write-through cache + debounce abstraction over `chrome.storage.local` and IndexedDB
5. **Zustand Stores** — notes, pages tree, UI state, todos, pomodoro, habits, bookmarks (each store persists through Storage Service)
6. **Feature Panels** — pomodoro, habits, journal, bookmarks, quotes — self-contained modules with own store slices
7. **Service Worker (minimal)** — `chrome.alarms` for pomodoro notifications and daily journal creation only

### Critical Pitfalls

1. **Single giant storage object** — storing all notes in one JSON blob causes a performance cliff at 50+ notes (2-5 second new tab open). Fix in Phase 1: granular `note:{id}` keys, lightweight index object, content loaded on demand. This cannot be migrated cheaply after user data exists.

2. **Editor blocking first paint** — BlockNote/ProseMirror initialization blocks the main thread; users see a blank page on every new tab open. Fix in Phase 1: render static shell + skeleton immediately, hydrate editor after; lazy-load non-essential extensions; keep one editor instance alive across page navigation (swap content with `editor.commands.setContent()`).

3. **Data loss from unhandled storage failures** — `chrome.storage.local` can fail silently (quota errors, LevelDB corruption). Fix in Phase 1: always check `chrome.runtime.lastError`, implement periodic silent backup export, write a redundant copy to IndexedDB, show a "Saved" indicator after every successful write.

4. **ProseMirror schema mismatches on upgrades** — adding new editor extensions without schema versioning silently drops user content. Fix in Phase 2 before any schema-changing feature ships: store `schemaVersion` with every note, write explicit migration functions (`v1_to_v2(doc)`), never remove or rename node types without a migration.

5. **Over-scoping the MVP** — the full feature list is 8+ months of work; trying to build all of it before shipping means it never ships. Fix across all phases: strict phase gates, no feature work beyond current phase scope, ship Phase 1 to the Chrome Web Store before building Phase 2.

## Implications for Roadmap

Based on combined research, the build order is strictly dependency-driven. Storage and app shell must exist before persistence works. The editor must be production-quality before adding organizational features around it. Page hierarchy depends on working note CRUD. Advanced editor features depend on a stable basic editor. Productivity widgets are independent of each other and can be parallelized. Power features (search, export, command palette) depend on having substantial content to operate on.

### Phase 1: Foundation + Storage + App Shell

**Rationale:** Everything depends on this. Storage architecture mistakes here are the most expensive to fix after user data exists. The app shell and dark theme must be in place before any feature work. CSP-compliant development environment must be established (test inside actual extension, not just Vite dev server).

**Delivers:** Working Chrome extension scaffold that loads in <500ms, persists data reliably, and renders a dark-themed shell with sidebar skeleton.

**Addresses:** Fast startup (table stake), dark theme (spec mandate), auto-save/persistence (table stake)

**Avoids:** Pitfall 1 (giant storage blob), Pitfall 3 (data loss), Pitfall 5 (CSP blocking), editor auto-focus stealing URL bar, synchronous storage reads on startup

**Must include:** WXT scaffold, Dexie.js + `chrome.storage.local` abstraction with write-through cache and debounce, granular `note:{id}` storage keys, lightweight page tree index, error handling on all storage calls, skeleton UI rendering strategy, `unlimitedStorage` permission, React error boundaries

### Phase 2: Core Editor

**Rationale:** The editor is the entire value proposition. A mediocre editor invalidates everything built on top of it. Must be solid before adding organizational features.

**Delivers:** Fully functional block editor in the new tab — headings, lists, bold/italic/code, markdown shortcuts, todo checkboxes, code blocks with syntax highlighting, keyboard shortcuts. Notes persist and load correctly.

**Addresses:** Rich text editor (P1 table stake), markdown shortcuts (P1), todo checkboxes (P1), code blocks + syntax highlighting (P1), keyboard shortcuts (P1)

**Uses:** BlockNote v0.47, @blocknote/mantine theme, Shiki (lazy-loaded for syntax highlighting), react-hotkeys-hook

**Avoids:** Pitfall 2 (editor blocking first paint — lazy-load extensions, keep editor instance alive), Pitfall 6 (schema mismatches — establish `schemaVersion` before any schema-changing features), storing HTML instead of Tiptap JSON

**Research flag:** Standard patterns — BlockNote is well-documented; skip research-phase

### Phase 3: Page Hierarchy + Organization

**Rationale:** Nested pages are the primary differentiator from flat-list competitors. Depends on working note CRUD and navigation from Phase 2. Sidebar tree depends on the flat page index established in Phase 1.

**Delivers:** Sidebar with expandable nested page tree, drag-and-drop reordering, breadcrumbs, pinned notes on dashboard, trash/recovery (30-day soft delete).

**Addresses:** Nested pages (P1 differentiator), sidebar navigation (P1 table stake), trash/recovery (P1 table stake), pinned notes (P2)

**Implements:** Flat page tree with `parentId` + `path[]` index, `buildTree()` computation, `@hello-pangea/dnd` for reordering

**Avoids:** Pitfall 3 (naive tree model — use flat list with path array, never nested JSON), orphan cleanup on parent deletion, sidebar requiring too many clicks (add breadcrumbs here)

### Phase 4: Advanced Editor Features

**Rationale:** Depends on stable base editor (Phase 2) and page identity system (Phase 3) — backlinks require page IDs to link between. These features push the editor from "good rich text" to "Notion-level."

**Delivers:** Slash command menu, inline tables, image/link embeds, `[[backlinks]]` with autocomplete and reverse index, focus mode.

**Addresses:** Backlinks (P2 differentiator), inline tables (P2), image/link embeds (P2), focus mode (P2)

**Uses:** BlockNote's Tiptap escape hatch for custom extensions (slash commands, backlink node, table extension), Radix UI dialogs for embed confirmation, lucide-react icons

**Avoids:** Pitfall 6 (schema migration — each new extension requires a schema version bump and migration function), broken backlink detection when linked note is deleted

**Research flag:** Backlink Tiptap extension needs API-level research during planning — custom ProseMirror node attributes and the reverse index update pattern are non-trivial

### Phase 5: Productivity Widgets (parallelizable)

**Rationale:** These features are independent of each other and of the editor internals. They can be built in parallel by multiple developers or in rapid succession. Depend only on the note data model (for daily journal and quick capture) being stable from Phase 3.

**Delivers:** Daily journal (auto-created dated note), quick capture (global `chrome.commands` shortcut), kanban board view for todos, pomodoro timer with session tracking, habit tracker with streaks, motivational quotes, bookmarks manager.

**Addresses:** Daily journal (P2), quick capture (P2), kanban (P2), pomodoro (P3), habit tracker (P3), motivational quotes (P3), bookmarks (P3)

**Uses:** `chrome.alarms` + `chrome.commands` in service worker, `@hello-pangea/dnd` for kanban, date-fns for date math, lucide-react icons

**Avoids:** Third-party integrations (Calendar, Gmail OAuth) — not in scope; built-in widgets only

**Research flag:** `chrome.commands` global shortcut API has a 4-shortcut limit and registration constraints — verify UX during planning

### Phase 6: Power Features + Polish

**Rationale:** Command palette and full-text search depend on having substantial content (pages, notes) to operate on. Export depends on stable note format. These features compound the value of everything built before them.

**Delivers:** Command palette (Cmd+K) with page navigation, action search, and settings access; full-text search across all notes via FlexSearch; Markdown export; keyboard navigation polish; "Saved" indicator; extension update migration runner.

**Addresses:** Command palette (P2), full-text search (P1 table stake — index built here at scale), export/Markdown (P2)

**Uses:** cmdk v1.0, FlexSearch v0.7 (in-memory inverted index, built on startup, updated incrementally on save), Tiptap JSON-to-Markdown serialization

**Avoids:** Full-text search scanning all note content on every query (build inverted index, not linear scan), search index not updating after edits

**Research flag:** Standard patterns for cmdk and FlexSearch; skip research-phase

### Phase Ordering Rationale

- **Storage first** because data architecture mistakes cannot be cheaply migrated after user data exists — this is the single most expensive pitfall in the research
- **Editor second** because the entire value proposition collapses without an excellent editor; organizational features built on a poor editor are worthless
- **Page hierarchy third** because nested pages are the #1 differentiator and depend on note CRUD being stable; backlinks (Phase 4) depend on page identity
- **Advanced editor fourth** because backlinks require page IDs from Phase 3; schema versioning system must be in place before adding schema-changing extensions
- **Widgets fifth** because they are independent and parallelizable; deferring them keeps early phases focused
- **Power features last** because search and command palette are most valuable when there is substantial content to operate on

### Research Flags

Phases needing deeper research during planning:
- **Phase 4 (Advanced Editor):** Backlink Tiptap extension — custom ProseMirror node definition, `[[trigger]]` autocomplete integration with BlockNote, and the reverse index update-on-save pattern are non-trivial and poorly documented for BlockNote specifically
- **Phase 5 (Quick Capture):** `chrome.commands` API constraints (4-shortcut limit, user-configurable shortcuts, popup vs. append-to-inbox UX) need validation before planning

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** WXT scaffold, Dexie.js, Zustand — all well-documented with official guides
- **Phase 2 (Core Editor):** BlockNote has thorough documentation; getting-started patterns are clear
- **Phase 3 (Page Hierarchy):** Flat tree with parentId is a standard pattern; `@hello-pangea/dnd` is well-documented
- **Phase 6 (Power Features):** cmdk and FlexSearch both have clear integration patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All primary technologies verified against official docs; version compatibility table explicit in STACK.md; alternatives clearly evaluated |
| Features | HIGH | Competitive analysis against real products (Momentum, New Tab Notes, Notion, Obsidian); feature dependency graph is explicit; MVP definition is opinionated |
| Architecture | HIGH | Patterns sourced from Chrome extension docs, Tiptap official guides, and production Notion-clone repositories; anti-patterns are specific and actionable |
| Pitfalls | HIGH | Pitfalls sourced from Chromium bug tracker, official Chrome extension performance docs, and Tiptap FAQ; phase-to-pitfall mapping is explicit |

**Overall confidence:** HIGH

### Gaps to Address

- **BlockNote backlink extension API:** BlockNote's custom extension API for `[[wiki-link]]` nodes is not extensively documented for v0.47. During Phase 4 planning, verify whether BlockNote exposes the Tiptap editor instance cleanly enough for a custom inline node with async autocomplete, or whether the escape hatch to raw Tiptap APIs is needed.

- **React 19 + tldraw v4.3 compatibility:** STACK.md flags this as needing verification. Before Phase 5+ whiteboard work, confirm tldraw v4.3 has verified React 19 support in its release notes. If not, pin to React 18.

- **chrome.storage.local quota behavior with `unlimitedStorage`:** Research notes that disk-level quota errors can still occur even with `unlimitedStorage` permission. During Phase 1, validate the actual error behavior and ensure the backup/recovery path handles this case.

- **cmdk version:** STACK.md notes MEDIUM confidence on cmdk version. Verify the latest v1.x API during Phase 6 planning.

## Sources

### Primary (HIGH confidence)
- [WXT Framework — wxt.dev](https://wxt.dev/) — extension framework docs, v0.20
- [BlockNote — blocknotejs.org](https://www.blocknotejs.org/) — v0.47 block editor
- [tldraw SDK — tldraw.dev](https://tldraw.dev/) — v4.3 whiteboard SDK
- [Zustand — zustand.docs.pmnd.rs](https://zustand.docs.pmnd.rs/) — v5.0 state management
- [Dexie.js — dexie.org](https://dexie.org/) — v4.0 IndexedDB wrapper
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/api/storage) — limits, async behavior, `unlimitedStorage`
- [Chrome Extension MV3 Architecture](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3) — MV3 constraints and service worker lifecycle
- [Chrome Extension CSP](https://developer.chrome.com/docs/extensions/reference/manifest/content-security-policy) — MV3 CSP restrictions
- [Tiptap Performance Guide](https://tiptap.dev/docs/guides/performance) — rendering optimization
- [Tiptap FAQ](https://tiptap.dev/docs/guides/faq) — schema validation, content loss gotchas
- [Chromium IndexedDB Storage Improvements](https://developer.chrome.com/docs/chromium/indexeddb-storage-improvements) — compression, IPC performance
- [FlexSearch — github.com/nextapps-de/flexsearch](https://github.com/nextapps-de/flexsearch) — client-side search

### Secondary (MEDIUM confidence)
- [2025 Browser Extension Framework Comparison](https://redreamality.com/blog/the-2025-state-of-browser-extension-frameworks-a-comparative-analysis-of-plasmo-wxt-and-crxjs/) — WXT vs CRXJS vs Plasmo
- [Liveblocks editor comparison 2025](https://liveblocks.io/blog/which-rich-text-editor-framework-should-you-choose-in-2025) — editor landscape survey
- [Best New Tab Extensions 2025-2026](https://tooltivity.com/categories/new-tab) — competitive landscape
- [Zustand + Chrome Storage Integration](https://www.drewalth.com/lab/zustand-chrome-storage/) — integration patterns
- [Chrome Storage Corruption Bug](https://bugs.chromium.org/p/chromium/issues/detail?id=261261) — data loss risk documentation
- [High-Performance New Tab Extension (maxmilton/new-tab)](https://github.com/MaxMilton/new-tab) — production extension architecture reference

---
*Research completed: 2026-03-19*
*Ready for roadmap: yes*
