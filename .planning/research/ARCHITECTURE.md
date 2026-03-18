# Architecture Research

**Domain:** Chrome Extension New Tab Productivity Workspace (Notion-level editor)
**Researched:** 2026-03-19
**Confidence:** HIGH

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Chrome Extension Shell (MV3)                      │
│  manifest.json + newtab.html + service-worker.js                     │
├─────────────────────────────────────────────────────────────────────┤
│                     Presentation Layer (React)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │
│  │ App Shell│  │ Sidebar  │  │ Editor   │  │ Feature Panels   │    │
│  │ + Router │  │ + Nav    │  │ (Tiptap) │  │ (Timer/Habits/..)│    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───────┬──────────┘    │
│       │              │             │                │               │
├───────┴──────────────┴─────────────┴────────────────┴───────────────┤
│                     State Layer (Zustand Stores)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Notes    │  │ Pages    │  │ UI State │  │ Features │            │
│  │ Store    │  │ Tree     │  │ Store    │  │ Store    │            │
│  └────┬─────┘  └────┬─────┘  └──────────┘  └────┬─────┘            │
│       │              │                           │                  │
├───────┴──────────────┴───────────────────────────┴──────────────────┤
│                  Persistence Layer (Storage Service)                  │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  Storage Abstraction (write-through cache + debounced save)  │    │
│  ├──────────────────┬───────────────────────────────────────────┤    │
│  │ chrome.storage   │  IndexedDB (large blobs:                  │    │
│  │ .local (metadata,│  whiteboard data, image embeds)           │    │
│  │ settings, small  │                                           │    │
│  │ note content)    │                                           │    │
│  └──────────────────┴───────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **App Shell** | Layout scaffold, routing between views, keyboard shortcut registry, command palette | React component with React Router (hash-based) or simple state-driven view switching |
| **Sidebar** | Page tree navigation, pinned notes, quick capture entry, search trigger | Recursive tree component with drag-and-drop reordering |
| **Editor (Tiptap)** | Rich text editing, markdown shortcuts, block types, slash commands | Tiptap v2/v3 with ProseMirror, custom extensions for page embeds and backlinks |
| **Feature Panels** | Pomodoro timer, habit tracker, daily journal, bookmarks, quotes | Independent React components, each with their own Zustand slice |
| **Notes Store** | CRUD for note content (Tiptap JSON), search index, backlink graph | Zustand store with persistence middleware adapted for chrome.storage |
| **Pages Tree** | Hierarchical page structure, parent-child relationships, ordering | Flat list with parentId references, computed tree for rendering |
| **UI State Store** | Active page, sidebar open/closed, focus mode, modal state | Zustand store, no persistence needed (ephemeral) |
| **Storage Service** | Abstraction over chrome.storage.local and IndexedDB, handles serialization, debouncing, and storage quota management | Custom service class with in-memory write-through cache |

## Recommended Project Structure

```
src/
├── manifest.json              # MV3 manifest
├── newtab.html                # Entry HTML for new tab override
├── newtab.tsx                 # React entry point
├── service-worker.ts          # Background service worker (minimal)
├── components/                # Shared UI components
│   ├── ui/                    # Primitives: Button, Input, Dialog, etc.
│   ├── layout/                # AppShell, Sidebar, MainContent
│   └── command-palette/       # Cmd+K command palette
├── editor/                    # Tiptap editor setup
│   ├── Editor.tsx             # Main editor component
│   ├── extensions/            # Custom Tiptap extensions
│   │   ├── slash-command.ts   # Slash menu for block types
│   │   ├── page-embed.ts     # Nested page reference blocks
│   │   ├── backlink.ts       # [[wiki-link]] support
│   │   ├── todo-block.ts     # Checkbox/todo items
│   │   ├── code-block.ts     # Syntax-highlighted code
│   │   └── table.ts          # Inline tables
│   ├── menus/                 # Floating toolbar, bubble menu
│   └── utils.ts               # Editor helpers
├── features/                  # Feature modules (self-contained)
│   ├── notes/                 # Note CRUD, listing, search
│   ├── pages/                 # Page tree, navigation, nested pages
│   ├── todos/                 # Todo panel, kanban board view
│   ├── kanban/                # Kanban board component
│   ├── whiteboard/            # Canvas/drawing feature
│   ├── pomodoro/              # Timer with session tracking
│   ├── habits/                # Habit tracker with streaks
│   ├── journal/               # Daily journal auto-creation
│   ├── bookmarks/             # Link/bookmark manager
│   ├── quotes/                # Motivational quotes rotation
│   └── trash/                 # Soft delete + recovery
├── stores/                    # Zustand state stores
│   ├── notes.store.ts         # Notes data + actions
│   ├── pages.store.ts         # Page tree structure
│   ├── ui.store.ts            # UI state (active page, modals)
│   ├── todos.store.ts         # Todo items
│   ├── pomodoro.store.ts      # Timer state
│   ├── habits.store.ts        # Habit data
│   └── bookmarks.store.ts    # Saved bookmarks
├── storage/                   # Persistence layer
│   ├── storage-service.ts     # Unified storage abstraction
│   ├── chrome-storage.ts      # chrome.storage.local wrapper
│   ├── indexed-db.ts          # IndexedDB for large data
│   ├── search-index.ts        # Full-text search index
│   └── migrations.ts          # Schema version migrations
├── hooks/                     # Shared React hooks
├── lib/                       # Utilities, constants, types
│   ├── types.ts               # Shared TypeScript types
│   ├── constants.ts           # App constants
│   └── keyboard.ts            # Keyboard shortcut registry
└── styles/                    # Global styles, theme tokens
    ├── globals.css             # Base styles, CSS custom properties
    └── theme.ts               # Dark theme token definitions
```

### Structure Rationale

- **editor/:** Isolated from features because the editor is the core product. Its extensions, menus, and configuration are complex enough to warrant their own module. Other features consume the editor but do not modify its internals.
- **features/:** Each feature is a self-contained module with its own components, hooks, and types. This enables parallel development (3 Claude instances working on different features) and clean boundaries.
- **stores/:** Separate from features because stores are shared across feature boundaries (e.g., the sidebar reads from notes store, the editor writes to it, the search feature queries it).
- **storage/:** Single abstraction layer prevents every feature from directly calling chrome.storage APIs. Centralizes debouncing, caching, error handling, and future migration to different backends.

## Architectural Patterns

### Pattern 1: Storage Abstraction with Write-Through Cache

**What:** An in-memory cache sits between Zustand stores and chrome.storage.local. Reads hit the cache (instant). Writes update the cache immediately and debounce the actual chrome.storage write (250-500ms).
**When to use:** Always, for all persistent data. chrome.storage.local is async and relatively slow for frequent operations like typing in an editor.
**Trade-offs:** Uses more memory but eliminates perceived latency. Risk of data loss on crash during debounce window (acceptable for a notes app -- last few characters at most).

**Example:**
```typescript
class StorageService {
  private cache: Map<string, any> = new Map();
  private pendingWrites: Map<string, NodeJS.Timeout> = new Map();

  async get<T>(key: string): Promise<T | undefined> {
    if (this.cache.has(key)) return this.cache.get(key);
    const result = await chrome.storage.local.get(key);
    const value = result[key];
    if (value !== undefined) this.cache.set(key, value);
    return value;
  }

  set(key: string, value: any, debounceMs = 300): void {
    this.cache.set(key, value);
    const existing = this.pendingWrites.get(key);
    if (existing) clearTimeout(existing);
    this.pendingWrites.set(key, setTimeout(() => {
      chrome.storage.local.set({ [key]: value });
      this.pendingWrites.delete(key);
    }, debounceMs));
  }
}
```

### Pattern 2: Flat Page Tree with Computed Hierarchy

**What:** Store pages as a flat array/map with `{ id, parentId, order, title, ... }`. Compute the tree structure on demand for rendering. Never store deeply nested tree objects.
**When to use:** Any hierarchical data (pages, nested notes). Notion uses this pattern internally.
**Trade-offs:** Slightly more complex to render (need to build tree from flat list), but vastly simpler for CRUD operations, reordering, and reparenting. Flat structures serialize cleanly to chrome.storage.

**Example:**
```typescript
interface Page {
  id: string;
  parentId: string | null;  // null = root level
  order: number;
  title: string;
  contentKey: string;  // key to look up Tiptap JSON in storage
  createdAt: number;
  updatedAt: number;
}

// Compute tree for sidebar rendering
function buildTree(pages: Page[]): TreeNode[] {
  const byParent = new Map<string | null, Page[]>();
  for (const page of pages) {
    const siblings = byParent.get(page.parentId) ?? [];
    siblings.push(page);
    byParent.set(page.parentId, siblings);
  }
  function recurse(parentId: string | null): TreeNode[] {
    return (byParent.get(parentId) ?? [])
      .sort((a, b) => a.order - b.order)
      .map(p => ({ ...p, children: recurse(p.id) }));
  }
  return recurse(null);
}
```

### Pattern 3: Content-Addressable Note Storage

**What:** Store each note's Tiptap JSON content under a separate storage key (`note:{id}`) rather than in a single large object. The page tree metadata is stored separately from content.
**When to use:** When individual documents can be large and you have many of them. Avoids reading/writing the entire dataset on every operation.
**Trade-offs:** More storage keys to manage, but reads only what is needed. Critical for performance when a user has hundreds of notes.

**Example:**
```typescript
// Metadata stored together (small, read on startup)
// Key: "pages_index"
// Value: Page[] (flat list, no content)

// Content stored individually (large, read on demand)
// Key: "note:abc123"
// Value: TiptapJSON document
```

### Pattern 4: Feature Module Pattern

**What:** Each feature (pomodoro, habits, kanban, etc.) is a self-contained module exporting: a React component, a Zustand store slice, and type definitions. Features communicate through shared stores, not direct imports of each other.
**When to use:** For all secondary features beyond the core editor. Enables parallel development and clean code splitting.
**Trade-offs:** Some duplication of patterns across features, but strong isolation prevents one feature from breaking another.

## Data Flow

### Editor Save Flow

```
[User types in Tiptap editor]
    |
    v
[Tiptap internal ProseMirror state updates]
    |
    v (onUpdate callback, ~every keystroke)
[Editor component calls notesStore.updateContent(pageId, json)]
    |
    v
[Zustand notes store updates in-memory state]
    |
    v (synchronous)
[StorageService.set("note:{id}", json) -- updates cache immediately]
    |
    v (debounced 300ms)
[chrome.storage.local.set({ "note:{id}": json })]
```

### App Startup Flow

```
[New tab opened -> newtab.html loads -> React mounts]
    |
    v
[StorageService hydrates cache from chrome.storage.local]
    |  (parallel reads: pages_index, settings, ui_preferences)
    v
[Zustand stores initialize from cached data]
    |
    v
[App Shell renders: Sidebar (from pages tree) + Editor (loads last active page)]
    |
    v (lazy, on demand)
[Feature panels load their data only when opened]
```

### Backlink Resolution Flow

```
[User types [[page name]] in editor]
    |
    v
[Backlink Tiptap extension intercepts, shows autocomplete from pages store]
    |
    v
[User selects page -> extension inserts backlink node with target pageId]
    |
    v
[On save, backlinks store scans document for backlink nodes]
    |
    v
[Backlinks index updated: { targetPageId -> [sourcePageIds] }]
    |
    v
[Target page's sidebar shows "Linked from: [source pages]"]
```

### Search Flow

```
[User opens search (Cmd+K or search icon)]
    |
    v
[Query sent to search index (in-memory, built on startup)]
    |
    v
[Search index returns matching pageIds + snippets]
    |  (index built from: page titles + flattened text content)
    v
[Results rendered in command palette / search modal]
```

### State Management

```
┌─────────────────────────────────────────────────────┐
│                  Zustand Stores                      │
│                                                      │
│  notes.store ─────> StorageService ───> chrome.storage│
│  pages.store ─────>      |                           │
│  todos.store ─────>   (cache)                        │
│  habits.store ────>      |                           │
│  pomodoro.store ──>   (debounce)                     │
│                                                      │
│  ui.store ────> (no persistence, ephemeral)           │
└─────────────────────────────────────────────────────┘

Components subscribe to stores via hooks:
  const pages = usePagesStore(s => s.pages)
  const activePageId = useUIStore(s => s.activePageId)
```

## Scaling Considerations

| Concern | 10-50 notes | 100-500 notes | 1000+ notes |
|---------|-------------|---------------|-------------|
| Storage size | Well within 10MB limit | Approaching 10MB, need `unlimitedStorage` permission | Move large content to IndexedDB, keep metadata in chrome.storage |
| Startup time | Load all metadata instantly | Metadata still fast, lazy-load content | Paginate page tree, virtual scrolling in sidebar |
| Search | Simple array filter on titles | In-memory full-text index (FlexSearch or similar) | Consider pre-built search index stored separately |
| Editor perf | No concern | No concern | No concern (Tiptap handles large docs well) |

### Scaling Priorities

1. **First bottleneck: chrome.storage.local size.** When users accumulate hundreds of notes with embedded images, the 10MB default limit will be hit. Mitigation: request `unlimitedStorage` permission from day one, and use IndexedDB for binary/large data.
2. **Second bottleneck: startup hydration time.** Loading all note content on startup becomes slow at scale. Mitigation: only load the page tree index on startup, load individual note content on navigation. This is why content-addressable storage (Pattern 3) is essential.

## Anti-Patterns

### Anti-Pattern 1: Single Giant Storage Object

**What people do:** Store all notes, todos, habits, and settings in one JSON blob under a single chrome.storage key.
**Why it's wrong:** Every save rewrites the entire dataset. At 5MB+, this causes noticeable UI jank (chrome.storage serializes synchronously on the calling side before the async write). Also, concurrent writes from different features can overwrite each other.
**Do this instead:** Use separate keys per entity type. Store note content individually (`note:{id}`). Keep metadata indexes small and separate from content.

### Anti-Pattern 2: Storing Tiptap HTML Instead of JSON

**What people do:** Call `editor.getHTML()` and store the HTML string.
**Why it's wrong:** HTML is lossy (some ProseMirror node attributes may not round-trip through HTML), larger than JSON, and requires parsing back through the DOM to restore. Also carries XSS risk if ever rendered with `dangerouslySetInnerHTML`.
**Do this instead:** Use `editor.getJSON()` to store Tiptap's native JSON format. It round-trips perfectly, is more compact, and is the officially recommended approach.

### Anti-Pattern 3: Direct chrome.storage Calls from Components

**What people do:** Call `chrome.storage.local.get/set` directly inside React components or event handlers.
**Why it's wrong:** No debouncing means every keystroke triggers a storage write. No caching means every read is async. No error handling means silent data loss. Impossible to test without mocking Chrome APIs.
**Do this instead:** All storage access goes through the StorageService abstraction. Components talk to Zustand stores, stores talk to StorageService, StorageService talks to chrome.storage.

### Anti-Pattern 4: Deep Nesting in Page Tree Data

**What people do:** Store the page tree as a deeply nested JSON tree: `{ children: [{ children: [{ children: [...] }] }] }`.
**Why it's wrong:** Moving a page to a different parent requires deserializing the entire tree, finding the node, removing it, inserting it at the new location, and re-serializing. Updates become O(n) where n is total pages. Merge conflicts are impossible to resolve.
**Do this instead:** Flat list with `parentId` references (Pattern 2 above). Moving a page is a single field update.

### Anti-Pattern 5: Loading Everything on Startup

**What people do:** Hydrate every note's full content, every todo, every habit record, all whiteboard data on new tab open.
**Why it's wrong:** New tab must be fast (<500ms to interactive). Loading megabytes of data defeats the purpose. Users open new tabs constantly.
**Do this instead:** Load only what is visible: page tree index, active page content, pinned notes, current todos. Lazy-load everything else on demand.

## Integration Points

### Chrome Extension APIs

| API | Usage | Notes |
|-----|-------|-------|
| `chrome.storage.local` | Primary persistence for metadata, settings, note content | Request `unlimitedStorage` permission. Async API. 10MB default, unlimited with permission. |
| `chrome_url_overrides.newtab` | New tab page override | Only one extension can override new tab. Declare in manifest.json. |
| `chrome.commands` | Global keyboard shortcut for quick capture | Limited to 4 shortcuts. Register in manifest.json. |
| `chrome.alarms` | Pomodoro timer notifications, daily journal creation | Service worker cannot use setInterval/setTimeout reliably. Use alarms API for scheduled tasks. |
| `chrome.notifications` | Pomodoro completion, habit reminders | Basic notification API. Declare `notifications` permission. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Editor <-> Notes Store | Zustand actions: `updateContent(id, json)`, `getContent(id)` | Editor calls store on every update (debounced internally). Store provides content on page navigation. |
| Sidebar <-> Pages Store | Zustand selectors: `usePageTree()`, actions: `createPage()`, `movePage()`, `deletePage()` | Sidebar subscribes reactively. Tree computation is memoized. |
| Feature Panels <-> Feature Stores | Each panel has its own store slice. No cross-feature store dependencies. | Features read from their own store only. If a feature needs note data (e.g., kanban reading todos from notes), it subscribes to the notes store read-only. |
| Stores <-> Storage Service | `storageService.get(key)`, `storageService.set(key, value)` | All stores use the same StorageService instance. Service handles caching, debouncing, serialization. |
| New Tab Page <-> Service Worker | `chrome.runtime.sendMessage` for alarms/notifications | Minimal communication. Service worker handles scheduled tasks only. |

## Build Order (Dependency Chain)

The following build order reflects true dependencies -- each phase requires the previous one.

```
Phase 1: Foundation
  ├── Chrome extension scaffold (manifest.json, newtab.html, build pipeline)
  ├── Storage service (chrome.storage abstraction with cache + debounce)
  ├── App shell (layout, dark theme, sidebar skeleton)
  └── Basic Zustand stores (pages, UI state)
       |
Phase 2: Core Editor
  ├── Tiptap integration (basic rich text: headings, lists, bold/italic)
  ├── Markdown shortcuts (type ## for H2, **bold**, etc.)
  ├── Note CRUD (create, read, update, delete via stores + storage)
  └── Page navigation (click sidebar item -> load note in editor)
       |
Phase 3: Page Hierarchy + Organization
  ├── Nested pages (parentId-based tree, create sub-pages)
  ├── Sidebar tree with expand/collapse
  ├── Drag-and-drop page reordering
  ├── Pinned notes
  └── Trash / soft delete with 30-day recovery
       |
Phase 4: Advanced Editor
  ├── Slash command menu (/ to insert block types)
  ├── Code blocks with syntax highlighting
  ├── Inline tables
  ├── Image and link embeds
  ├── [[Backlinks]] with autocomplete and backlink index
  └── Focus mode
       |
Phase 5: Productivity Features (parallelizable)
  ├── Todo panel + checkbox blocks in notes
  ├── Kanban board view
  ├── Pomodoro timer
  ├── Habit tracker
  ├── Daily journal (auto-created)
  ├── Bookmarks manager
  └── Motivational quotes
       |
Phase 6: Power Features
  ├── Command palette (Cmd+K)
  ├── Full-text search
  ├── Quick capture (global shortcut)
  ├── Import/Export (Markdown, PDF)
  └── Keyboard navigation polish
```

**Build order rationale:**
- Storage service and app shell must exist before anything else can persist or render.
- The editor is the core product and must be solid before adding organizational features around it.
- Page hierarchy depends on working note CRUD and navigation.
- Advanced editor features depend on the basic editor being stable.
- Productivity features (Phase 5) are independent of each other and can be built in parallel by multiple developers/instances.
- Power features (Phase 6) depend on having content to search, export, and navigate.

## Sources

- [Chrome Extension Manifest V3 Architecture Guide](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)
- [chrome.storage API Documentation](https://developer.chrome.com/docs/extensions/reference/api/storage)
- [Tiptap Editor Core Concepts](https://tiptap.dev/docs/editor/core-concepts/introduction)
- [Tiptap Export to JSON and HTML](https://tiptap.dev/docs/guides/output-json-html)
- [Zustand + Chrome Storage Integration](https://www.drewalth.com/lab/zustand-chrome-storage/)
- [Chrome Extension Performance Optimization](https://groups.google.com/a/chromium.org/g/chromium-extensions/c/s84dszSHAns)
- [IndexedDB vs LocalStorage Comparison](https://rxdb.info/articles/localstorage-indexeddb-cookies-opfs-sqlite-wasm.html)
- [High-Performance New Tab Extension (maxmilton/new-tab)](https://github.com/MaxMilton/new-tab)
- [Notion Clone Architecture Patterns](https://github.com/topics/notion-clone?o=desc&s=stars)

---
*Architecture research for: Chrome Extension New Tab Productivity Workspace*
*Researched: 2026-03-19*
