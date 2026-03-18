# Feature Research

**Domain:** Chrome new tab productivity extension with Notion-level note-taking
**Researched:** 2026-03-19
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist in any new tab productivity extension. Missing these means users leave immediately.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Rich text editor with formatting toolbar | Every competitor (New Tab Notes, nuTab, Kotes) has this. Users won't type in plain text. | HIGH | This is the foundation. Use Tiptap/ProseMirror. Must support bold, italic, headings, lists, blockquote at minimum. |
| Markdown shortcuts | Power users expect `**bold**`, `# heading`, `- list` to auto-convert. Notion, Obsidian, and even nuTab support this. | MEDIUM | Tiptap has built-in input rules for this. Critical for matching the "Notion feel." |
| Auto-save / persistence | Every new tab notes extension auto-saves. Users will lose trust instantly if a note disappears. | LOW | `chrome.storage.local` with debounced writes. Non-negotiable from day one. |
| Fast startup (<500ms) | New tab opens constantly. Momentum loads in ~200ms. If it's sluggish, users switch back to default tab. | MEDIUM | Lazy-load heavy features (whiteboard, kanban). Render editor and sidebar first. |
| Dark theme | The project spec mandates this, and it aligns with developer/power-user preferences. Most popular new tab extensions offer dark mode. | LOW | Single theme simplifies CSS. Use CSS custom properties for future theme support. |
| Sidebar navigation | Notion, Obsidian, AppFlowy, AFFiNE all have collapsible sidebar with page tree. Users expect a file-tree-like nav. | MEDIUM | Collapsible, draggable tree. Must support nested pages visually. |
| Full-text search | Users accumulate notes fast. Notion, Obsidian, Evernote all have instant search. Without it, notes become a graveyard. | MEDIUM | Index notes in memory on load. For local storage scale this is fine. No need for a search engine. |
| Trash / recovery | Accidental deletion anxiety is real. Notion has 30-day trash. Users expect undo-ability. | LOW | Soft delete with timestamp. Purge after 30 days. Simple to implement. |
| Keyboard shortcuts | Cmd+B, Cmd+I, Cmd+K for link, etc. Every modern editor has these. | LOW | Tiptap provides these out of the box. Just configure and document them. |
| Todo checkboxes | Momentum, New Tab Todo List, and every productivity new tab has basic checkboxes. It's the #1 expected widget. | LOW | Tiptap checkbox extension. Embeddable within any note as blocks. |
| Code blocks with syntax highlighting | Expected by developer audience. Notion, Obsidian, every serious note app has this. | MEDIUM | Use a lightweight highlighter (Shiki or Highlight.js). Language selector dropdown. |
| Export (Markdown at minimum) | Users need an escape hatch. Lock-in fear kills adoption, especially for local-only tools. | MEDIUM | Markdown export is straightforward from Tiptap. PDF export can be deferred. |

### Differentiators (Competitive Advantage)

Features that set NewTab apart from existing new tab extensions. The gap in the market: existing new tab extensions are shallow (pretty backgrounds + simple todo list), while full note apps (Notion, Obsidian) aren't embedded in the new tab. NewTab bridges this gap.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Nested pages (infinite depth) | No new tab extension does this. Momentum has a flat todo list. This is what makes it "Notion-level." | HIGH | Tree data structure with parent-child relationships. Sidebar must render recursively. Drag-and-drop reordering. |
| Wiki-style backlinks (`[[link]]`) | Obsidian's killer feature, absent from every new tab extension. Connects notes into a knowledge graph. | HIGH | Requires note title indexing, autocomplete dropdown on `[[` trigger, and a backlinks panel showing inbound links. |
| Command palette (Cmd+K) | Power-user accelerator. Notion and VS Code have trained users to expect this. No new tab extension has it. | MEDIUM | Search across pages, actions, and settings. Fuzzy matching. This is a force multiplier for the whole app. |
| Kanban board view | Notion's board view for databases. Existing new tab extensions only have flat todo lists. | HIGH | Drag-and-drop columns. Needs a "status" property system on notes/todos. Consider a simplified version (not full database views). |
| Daily journal (auto-created daily note) | Obsidian's Daily Notes plugin is beloved. Auto-creating a dated note with prompts removes friction for journaling habit. | MEDIUM | Template system for daily notes. Auto-create on first new tab of the day. Link to previous day. |
| Quick capture (global shortcut) | Unique to having a Chrome extension -- can capture thoughts from any tab without switching context. | MEDIUM | Chrome extension API `chrome.commands` for global shortcut. Opens a small popup or appends to an inbox note. |
| Focus mode | Distraction-free writing. Hides sidebar, toolbar, everything except the editor. Writers love this. | LOW | CSS toggle. Hide sidebar and chrome. Fade in toolbar on hover. Easy win. |
| Pinned notes on dashboard | No new tab extension shows important notes on the landing view. Most show a background photo. Notes-first landing is novel. | LOW | Pin flag on notes. Dashboard renders pinned notes as cards. Simple but high-impact for the "notes-first" value prop. |
| Inline tables | Notion's inline tables let you embed structured data in any note. No new tab extension has this. | HIGH | Tiptap table extension exists but needs styling work. Keep it simple -- no database views, just visual tables. |
| Whiteboard / canvas | Obsidian Canvas, Notion's limited drawing -- freeform spatial thinking. Very few note apps do this well. | VERY HIGH | Embed Excalidraw or tldraw. Heavy dependency. Defer to later phase. |
| Pomodoro timer with session tracking | Some new tab extensions (New Tab Calendar) have timers, but session tracking with note association is unique. | MEDIUM | Timer component with configurable work/break intervals. Store session history. Link sessions to notes/tasks. |
| Habit tracker with streaks | Novel for a new tab extension. Daily streaks create retention/stickiness. | MEDIUM | Simple grid of habits x days. Check off daily. Calculate and display streaks. |
| Motivational quotes | Momentum's signature feature. Nice-to-have, adds personality. | LOW | Built-in JSON library of quotes. Rotate on refresh or daily. Minimal effort. |
| Bookmarks / links manager | Replaces Chrome's bookmarks bar for frequently used links. Some new tab extensions (New Tab Widgets, Dashy) have this. | LOW | Grid or list of saved links with favicons. Quick-add from current page. |
| Image and link embeds | Notion supports embedding images, bookmarks, and links inline. Expected in a "Notion-level" editor. | MEDIUM | Tiptap image extension + custom bookmark embed block. URL unfurling for link previews. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Cloud sync / accounts | Users want multi-device access | Requires a backend, auth system, conflict resolution, and ongoing infrastructure costs. Massively increases scope and maintenance burden. | Export/import for manual sync. Consider Chrome sync storage (limited to 100KB) for small metadata only. Cloud sync is a v2+ concern. |
| AI writing assistant | Trendy in 2025-2026 (Notion AI, Mem). Users ask for it. | Requires API keys, costs money per query, adds latency, and the value is questionable for a local-first note app. Distracts from core editor quality. | Omit entirely in v1. If added later, make it opt-in with user's own API key. |
| Full database views (Notion-style) | Power users want table, board, calendar, timeline, gallery views on any dataset | Enormously complex. Notion spent years building this with a large team. Property types, filters, sorts, grouping, formulas -- each is a project. | Offer kanban for todos and inline tables for notes. Skip the full relational database system. |
| Theme marketplace / custom CSS | Users want personalization | Maintenance nightmare. Themes break on UI changes. Custom CSS is a security risk in extensions. | Dark theme only for v1. Consider 2-3 preset accent colors later. |
| Real-time collaboration | "Can I share with my team?" | Requires CRDT/OT, conflict resolution, permissions, and a server. Completely changes the architecture. | Single-user, local-only. Share via export. |
| Browser history / analytics dashboard | "Show me my browsing patterns" | Privacy-invasive, requires `history` permission which scares users during install, and is tangential to note-taking. | Omit. Not aligned with the core value prop. |
| Widgets ecosystem (weather, stocks, calendar integrations) | Dashy and New Tab Widgets offer this | Each widget is its own maintenance burden. Calendar/Gmail integration requires OAuth and Google API. Dilutes the notes-first focus. | Start with built-in widgets only (timer, quotes, habits). No third-party integrations in v1. |
| Graph view of backlinks | Obsidian's graph view looks impressive | Visually cool but rarely useful in practice. Most Obsidian users report using it for "wow factor" not daily work. Expensive to render. | Show backlinks as a simple list in a panel. Skip the force-directed graph visualization. |
| Import from Notion/Evernote/Obsidian | "I have existing notes elsewhere" | Each import format is a separate parser. Notion exports are complex (nested markdown + CSV). High effort, low frequency use. | Support Markdown import (covers Obsidian). Defer Notion/Evernote import parsers. |
| Mobile app / responsive design | "I want it on my phone too" | Chrome extensions don't run on mobile. Building a separate mobile app is a different product. | Stay Chrome-extension-only. The new tab IS the product surface. |

## Feature Dependencies

```
[Rich Text Editor (Tiptap)]
    |--required-by--> [Markdown Shortcuts]
    |--required-by--> [Code Blocks]
    |--required-by--> [Inline Tables]
    |--required-by--> [Image/Link Embeds]
    |--required-by--> [Todo Checkboxes]
    |--required-by--> [Focus Mode]

[Note Data Model & Storage]
    |--required-by--> [Rich Text Editor]
    |--required-by--> [Nested Pages]
    |--required-by--> [Full-Text Search]
    |--required-by--> [Trash/Recovery]
    |--required-by--> [Export]

[Sidebar Navigation]
    |--required-by--> [Nested Pages] (visual tree)
    |--required-by--> [Pinned Notes]

[Nested Pages]
    |--required-by--> [Backlinks] (need page identity to link between)
    |--required-by--> [Daily Journal] (auto-created pages)

[Backlinks]
    |--enhances--> [Full-Text Search] (search can surface linked notes)

[Todo Checkboxes]
    |--required-by--> [Kanban Board] (needs todo/task data model)

[Command Palette]
    |--enhances--> [Full-Text Search]
    |--enhances--> [Nested Pages] (quick navigation)

[Pomodoro Timer] -- independent, no dependencies
[Habit Tracker] -- independent, no dependencies
[Motivational Quotes] -- independent, no dependencies
[Bookmarks Manager] -- independent, no dependencies
[Whiteboard] -- independent, heavy standalone feature

[Quick Capture]
    |--requires--> [Note Data Model & Storage]
    |--enhances--> [Daily Journal] (capture to daily note)
```

### Dependency Notes

- **Rich Text Editor is the foundation:** Nearly every feature depends on the editor being solid. It must be built first and built well. This aligns with the project's stated core value.
- **Note Data Model enables everything:** The storage schema (pages, hierarchy, metadata) must be designed before building features that create/query notes.
- **Nested Pages unlock backlinks and daily journal:** You can't link between pages or auto-create daily pages without a page hierarchy system.
- **Independent widgets (timer, habits, quotes, bookmarks) can be built in parallel:** These have no dependency on the editor or note system. Good candidates for parallel development.
- **Whiteboard is isolated and heavy:** No other feature depends on it. It can be deferred to the last phase without blocking anything.

## MVP Definition

### Launch With (v1.0)

The minimum viable product that validates "Notion-level editor in a new tab." Focus ruthlessly on the editor experience.

- [x] Rich text editor with markdown shortcuts -- THE core value. If this isn't great, nothing else matters.
- [x] Note data model with chrome.storage.local persistence -- Notes must persist reliably.
- [x] Sidebar navigation with nested pages -- Distinguishes from flat-list competitors immediately.
- [x] Todo checkboxes (inline in notes) -- Table stakes for productivity.
- [x] Full-text search -- Usable once you have more than 5 notes.
- [x] Trash/recovery -- Safety net for user trust.
- [x] Dark theme -- Mandatory per spec.
- [x] Basic keyboard shortcuts -- Cmd+B/I/K, Cmd+P for command palette.
- [x] Fast startup -- Must load in <500ms or users bounce.
- [x] Code blocks with syntax highlighting -- Developer audience expects this.

### Add After Validation (v1.x)

Features to layer in once the core editor loop is proven solid.

- [ ] Backlinks (`[[link]]` syntax) -- Add once page system is stable and users have enough notes to link.
- [ ] Command palette (Cmd+K) -- Power-user accelerator. Meaningful once there are enough pages to navigate.
- [ ] Daily journal (auto-created daily note) -- Builds habit/retention. Add when note creation is smooth.
- [ ] Quick capture (global shortcut) -- Extension-native feature. Add once note storage is battle-tested.
- [ ] Kanban board view for todos -- Add once todo usage patterns are understood.
- [ ] Pinned notes on dashboard -- Add once users have notes worth pinning.
- [ ] Focus mode -- Low effort, high impact. Add anytime after editor works.
- [ ] Export (Markdown) -- Escape hatch. Important for trust but not for initial validation.
- [ ] Image/link embeds -- Enrich the editor. Add after core text editing is polished.
- [ ] Inline tables -- Complex Tiptap extension. Add after editor stability is proven.

### Future Consideration (v2+)

Features to defer until the product has proven traction.

- [ ] Whiteboard/canvas -- Very high complexity (Excalidraw/tldraw integration). Defer until core note-taking is mature.
- [ ] Pomodoro timer with session tracking -- Independent widget. Nice retention feature but not core.
- [ ] Habit tracker with streaks -- Independent widget. Adds stickiness but not core value.
- [ ] Motivational quotes -- Low effort but also low priority. Polish feature.
- [ ] Bookmarks/links manager -- Competes with browser bookmarks. Add if users request it.
- [ ] Import from Markdown files -- Useful for Obsidian migrants. Add based on user demand.
- [ ] PDF export -- Complex (needs headless rendering). Defer significantly.
- [ ] Multiple accent color options -- Minor personalization. Defer.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Rich text editor + markdown shortcuts | HIGH | HIGH | P1 |
| Note persistence (chrome.storage.local) | HIGH | LOW | P1 |
| Sidebar with nested pages | HIGH | MEDIUM | P1 |
| Dark theme | HIGH | LOW | P1 |
| Todo checkboxes | HIGH | LOW | P1 |
| Full-text search | HIGH | MEDIUM | P1 |
| Trash/recovery | MEDIUM | LOW | P1 |
| Code blocks + syntax highlighting | MEDIUM | MEDIUM | P1 |
| Fast startup optimization | HIGH | MEDIUM | P1 |
| Keyboard shortcuts (basic) | MEDIUM | LOW | P1 |
| Backlinks ([[link]]) | HIGH | HIGH | P2 |
| Command palette (Cmd+K) | HIGH | MEDIUM | P2 |
| Daily journal | MEDIUM | MEDIUM | P2 |
| Quick capture | MEDIUM | MEDIUM | P2 |
| Focus mode | MEDIUM | LOW | P2 |
| Kanban board | MEDIUM | HIGH | P2 |
| Pinned notes dashboard | MEDIUM | LOW | P2 |
| Export (Markdown) | MEDIUM | MEDIUM | P2 |
| Image/link embeds | MEDIUM | MEDIUM | P2 |
| Inline tables | MEDIUM | HIGH | P2 |
| Whiteboard | LOW | VERY HIGH | P3 |
| Pomodoro timer | LOW | MEDIUM | P3 |
| Habit tracker | LOW | MEDIUM | P3 |
| Motivational quotes | LOW | LOW | P3 |
| Bookmarks manager | LOW | LOW | P3 |

**Priority key:**
- P1: Must have for launch -- the core editor + note system
- P2: Should have, add in subsequent releases -- knowledge management + productivity features
- P3: Nice to have, future consideration -- widgets and auxiliary features

## Competitor Feature Analysis

| Feature | Momentum | New Tab Notes | Obsidian | Notion | NewTab (Ours) |
|---------|----------|---------------|----------|--------|---------------|
| Rich text editor | No (simple text) | Basic formatting | Markdown-first | Block-based WYSIWYG | Block-based WYSIWYG with MD shortcuts |
| Nested pages | No | No | Folder + links | Yes (infinite) | Yes (infinite) |
| Backlinks | No | No | Yes (core feature) | Yes (basic) | Yes (v1.x) |
| Todos | Simple list | No | Plugin (Dataview) | Checkbox blocks + database | Inline checkboxes + kanban |
| Kanban | No | No | Plugin | Database board view | Simplified board view |
| Search | No | No | Excellent | Excellent | Full-text across notes |
| Daily notes | No | No | Plugin (popular) | Manual | Auto-created with template |
| Code blocks | No | No | Yes | Yes | Yes with syntax highlighting |
| Whiteboard | No | No | Canvas (built-in) | Limited | Excalidraw embed (v2) |
| Dark theme | Yes | Yes | Yes | Yes | Yes (default, only) |
| Local-only | Yes | Yes | Yes (default) | No (cloud) | Yes |
| New tab integration | YES | YES | No | No | YES |
| Startup speed | Fast (~200ms) | Fast | N/A (desktop app) | N/A (web app) | Target <500ms |
| Motivational quotes | Yes (signature) | No | No | No | Yes (v2) |

**Key insight:** The competitive gap is clear. New tab extensions (Momentum, New Tab Notes) are shallow -- pretty backgrounds with simple widgets. Full note apps (Notion, Obsidian) are powerful but aren't embedded in the browser's new tab. NewTab occupies the intersection: a Notion-depth editor that lives where you already are (every new tab). No competitor currently fills this niche.

## Sources

- [Best New Tab Extensions for Chrome 2025 - New Tab Widgets](https://newtabwidgets.com/blog/best-new-tab-extensions)
- [Best New Tab Browser Extensions 2026 Guide](https://tooltivity.com/categories/new-tab)
- [The 8 Best Chrome New Tab Extensions 2025 - Medium](https://medium.com/@rvetstvgyvtsuxthwp/the-8-best-chrome-new-tab-extensions-in-2025-honest-comparison-b7f5b40d8479)
- [Best 7 Notion Alternatives 2026 - The Business Dive](https://thebusinessdive.com/notion-alternatives)
- [The 9 Best Notion Alternatives 2026 - Zapier](https://zapier.com/blog/best-notion-alternatives/)
- [40 Best Notion Alternatives 2026 - NoteApps.info](https://noteapps.info/best_notion_alternatives_2026_personalized_ad_free)
- [Obsidian Review - Lindy](https://www.lindy.ai/blog/obsidian-review)
- [Complete Obsidian Overview 2025 - eesel.ai](https://www.eesel.ai/blog/obsidian-overview)
- [Notion Ultimate Guide - Morgen](https://www.morgen.so/blog-posts/the-ultimate-notion-guide-from-beginner-to-pro)
- [Top 5 Note-Taking Browser Extensions 2025 - Medium](https://medium.com/@mariusbongarts/top-5-note-taking-browser-extensions-in-2025-5adf99c7eff3)
- [New Tab Notes Chrome Extension](https://newtabnotes.com)
- [Notion Board View Help Center](https://www.notion.com/help/boards)

---
*Feature research for: Chrome new tab productivity extension with Notion-level note-taking*
*Researched: 2026-03-19*
