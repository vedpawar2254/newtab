# Pitfalls Research

**Domain:** Chrome extension new tab productivity workspace (Notion-level editor)
**Researched:** 2026-03-19
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Storing All Data in chrome.storage.local as One Giant Object

**What goes wrong:**
Developers dump the entire note tree -- all pages, all content, all metadata -- into a single key in `chrome.storage.local`. Every save serializes the entire dataset. Every load deserializes it. At 50+ notes with rich content, new tab open time degrades from instant to 2-5 seconds. `chrome.storage.local` serializes values multiple times across IPC boundaries (browser process deserialization from LevelDB, IPC serialization, IPC send, IPC deserialization), so large payloads compound this overhead dramatically.

**Why it happens:**
`chrome.storage.local` has a simple key-value API that encourages storing one big JSON blob. It works fine with 5 notes. It falls apart at 100.

**How to avoid:**
- Store each note/page as its own key (`note:{id}` pattern) so reads and writes are granular.
- Keep a lightweight index object (just IDs, titles, parent refs, timestamps) separate from content.
- Load content lazily -- only fetch note body when the user opens that note.
- Consider IndexedDB for note content storage. Chrome has optimized IndexedDB significantly (compression, concurrent access improvements). Use `chrome.storage.local` only for small config/metadata. IndexedDB handles structured data with less IPC overhead for large objects.
- Implement write debouncing (300-500ms) so rapid typing does not trigger a storage write on every keystroke.

**Warning signs:**
- New tab load time exceeding 500ms during development with test data.
- Visible lag when switching between notes.
- `chrome.storage.local.getBytesInUse()` approaching megabytes for a handful of notes.

**Phase to address:**
Phase 1 (Foundation/Core Architecture). The storage abstraction layer must be correct from day one. Migrating a flat storage model to a granular one after users have data is painful.

---

### Pitfall 2: Rich Text Editor Initialization Blocking First Paint

**What goes wrong:**
Tiptap/ProseMirror is a substantial library. Initializing the editor with all extensions (tables, code blocks, task lists, embeds, slash commands) on new tab open blocks the main thread. Users see a blank white page for 500ms-1s before the editor renders. Since this happens on every new tab, it is far more noticeable than a normal page load.

**Why it happens:**
Developers load and initialize the full editor eagerly because it is the "core feature." They do not realize that new tab pages have a higher performance bar than regular web apps -- users expect instant rendering comparable to Chrome's native new tab.

**How to avoid:**
- Render a static shell (sidebar, layout, last-viewed note title) immediately with no JS dependency. Show the editor skeleton first, hydrate after.
- Lazy-load editor extensions. Load StarterKit first, then load tables/code blocks/embeds only when the user actually uses them or after idle.
- Use `requestIdleCallback` or `setTimeout(..., 0)` to defer non-critical editor extension registration.
- Pre-render the last-viewed note content as static HTML on save, display it instantly, then swap in the live editor once initialized.
- Keep the Tiptap editor instance alive across navigation within the extension (do not destroy/recreate on every page switch).

**Warning signs:**
- Lighthouse "Time to Interactive" exceeding 300ms on the new tab page.
- Users reporting "flash of white" or "blank page flicker" when opening new tabs.
- Bundle size of the main chunk exceeding 200KB gzipped.

**Phase to address:**
Phase 1 (Editor Foundation). The rendering strategy and code-splitting approach must be established before building features on top of the editor.

---

### Pitfall 3: Naive Nested Pages Data Model Leading to Recursive Query Hell

**What goes wrong:**
Modeling nested pages as a tree with parent references seems natural, but operations like "show breadcrumbs," "move page and all children," "delete page and descendants," and "search across all sub-pages" all require recursive traversal. With `chrome.storage.local` (no query engine), this means loading every note to walk the tree. Backlinks make it worse -- you need to scan all notes to find which ones reference a given page.

**Why it happens:**
Developers model the data like a filesystem (parent_id on each node) without thinking about the read patterns. Relational databases handle recursive queries with CTEs. `chrome.storage.local` has no query capability at all.

**How to avoid:**
- Maintain a separate lightweight tree index: `{ id, title, parentId, childIds[], depth, path[] }` for every page, stored as one object. This is small (IDs and titles only) and supports all navigation operations without loading note content.
- Store a `path` array on each note (e.g., `["root", "projectA", "subpage1"]`) so breadcrumbs and move operations do not require tree traversal.
- For backlinks, maintain a reverse index: `{ noteId: [noteIds that reference it] }`. Update this index on save. Never scan all notes to compute backlinks.
- For deletion, use the tree index to collect all descendant IDs, then batch-delete from storage.

**Warning signs:**
- Operations that load more than the current note's content.
- Backlink computation taking noticeable time.
- "Show all sub-pages" requiring iteration over all stored notes.

**Phase to address:**
Phase 1 (Data Model Design). The tree index and backlink index patterns must be designed before any nested page or linking features are built.

---

### Pitfall 4: Data Loss from Unhandled Storage Failures

**What goes wrong:**
`chrome.storage.local.set()` can fail silently if the quota is exceeded (even with `unlimitedStorage`, disk-level quota errors can occur). Chrome profile corruption can wipe extension storage entirely. Users lose weeks of notes with no recovery path. This is the single most damaging failure for a notes app.

**Why it happens:**
Developers treat `chrome.storage.local` as a reliable database. It is not. It is a browser-managed key-value store backed by LevelDB that can corrupt on crash, on Chrome update, or on disk errors. The Chromium bug tracker has unresolved issues about `chrome.storage.sync` database corruption, and `chrome.storage.local` shares similar failure modes.

**How to avoid:**
- Always check `chrome.runtime.lastError` after every storage operation (or handle rejected promises with async/await).
- Implement automatic periodic export: silently serialize all notes to a downloadable JSON/ZIP on a schedule (e.g., weekly), offering the user a "Download Backup" button.
- On every save, write a `lastSaved` timestamp. On load, if `lastSaved` is missing or storage is empty but was previously populated, show a recovery prompt.
- Implement the 30-day trash feature early -- soft-delete with a `deletedAt` timestamp rather than actually removing data.
- Consider writing a redundant copy to IndexedDB as a secondary backup store.

**Warning signs:**
- No error handling around `chrome.storage` calls in the codebase.
- No export/backup feature in the roadmap.
- Testing only with small amounts of data.

**Phase to address:**
Phase 1 (Storage Layer). Error handling and backup infrastructure must exist from the first version. Adding it retroactively means users between launch and the fix have no safety net.

---

### Pitfall 5: Content Security Policy Blocking Editor Features

**What goes wrong:**
Chrome extensions enforce a strict CSP: `script-src 'self'; object-src 'self'`. No inline scripts, no `eval()`, no dynamic code generation. Some editor features (syntax highlighting libraries that use `eval`, certain markdown parsers, embedded content) break silently under this policy. Developers build features in a dev environment that works, then discover they fail in the actual extension context.

**Why it happens:**
Development often happens in a regular web page context (Vite dev server) where CSP is not enforced. The extension CSP only kicks in when loaded as an actual Chrome extension. Libraries that dynamically create script elements or use `new Function()` will fail.

**How to avoid:**
- Test in the actual extension context from day one, not just the dev server. Set up a workflow that builds and loads the extension on every change.
- Audit all dependencies for `eval()`, `new Function()`, or inline script usage before adopting them.
- For syntax highlighting, use libraries like Shiki or Prism that do not rely on `eval` (avoid older highlight.js versions that may).
- For embedded content (iframes to external sites), use sandboxed pages if needed, but prefer rendering content natively.
- Set the CSP explicitly in `manifest.json` under `content_security_policy.extension_pages` to understand exactly what is and is not allowed.

**Warning signs:**
- Features that work in dev but fail when loaded as an extension.
- Console errors mentioning "Refused to evaluate a string as JavaScript" or "Refused to execute inline script."
- Third-party libraries that document CSP workarounds.

**Phase to address:**
Phase 1 (Project Setup). The development environment must mirror extension constraints from the start. Every phase should test within the actual extension context.

---

### Pitfall 6: ProseMirror Schema Mismatches Causing Silent Content Loss

**What goes wrong:**
When the Tiptap/ProseMirror schema changes between versions (adding new block types, modifying attributes, changing nesting rules), existing saved content that does not conform to the new schema is silently dropped during deserialization. Users open a note and find paragraphs, tables, or formatting gone. ProseMirror explicitly states: "content that doesn't conform to the schema will be lost."

**Why it happens:**
Developers evolve the editor schema as they add features (add table support, add code block languages, change list nesting rules) without considering that previously saved content was serialized under the old schema. There is no built-in migration system in Tiptap or ProseMirror.

**How to avoid:**
- Store content as Tiptap JSON (not HTML). JSON is more predictable for schema evolution.
- Version the schema. Store a `schemaVersion` field with every note. When loading, check the version and apply migrations before deserializing.
- Write explicit migration functions: `v1_to_v2(doc)`, `v2_to_v3(doc)` that transform the JSON structure.
- Never remove or rename node/mark types in the schema without a migration. Only add new types as additive changes.
- Test schema changes against a corpus of saved documents before shipping.

**Warning signs:**
- Adding new editor extensions without considering existing saved content.
- No `schemaVersion` field in stored notes.
- Users reporting "my note looks different" or "content is missing" after an extension update.

**Phase to address:**
Phase 2 (Editor Features). The schema versioning system should be in place before any schema-changing features (tables, code blocks, embeds) are added beyond the initial set.

---

### Pitfall 7: Over-Scoping the MVP and Never Shipping

**What goes wrong:**
The feature list includes a rich editor, nested pages, backlinks, todos, kanban, whiteboard, pomodoro, habit tracker, journal, bookmarks, quotes, command palette, import/export, search, and more. Trying to build all of these before releasing results in an 8-month project that never ships. Each feature introduces bugs in existing features, and integration complexity grows quadratically.

**Why it happens:**
The Notion comparison sets an impossibly high bar for v1. Notion has hundreds of engineers and years of development. A solo developer building a Chrome extension needs ruthless prioritization.

**How to avoid:**
- Phase 1 MVP: Editor + nested pages + basic sidebar navigation + local persistence. Nothing else.
- Phase 2: Backlinks, search, todos, command palette.
- Phase 3: Kanban, journal, bookmarks, quotes.
- Phase 4: Whiteboard, pomodoro, habit tracker.
- Phase 5: Import/export, polish, advanced features.
- Ship Phase 1 to the Chrome Web Store. Real usage generates feedback that reshapes priorities for everything after.
- Each phase should be independently usable. If development stops at Phase 2, the product still works.

**Warning signs:**
- Working on kanban boards before the basic editor is polished and stable.
- Feature branches for 5+ features in parallel.
- No published extension after 4+ weeks of development.

**Phase to address:**
All phases. This is a project management pitfall, not a technical one. The roadmap must enforce strict phase gates.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Storing HTML instead of Tiptap JSON | Simpler initial implementation | Schema migrations become impossible; HTML parsing is lossy and fragile | Never -- use JSON from day one |
| Single storage key for all data | No need for storage abstraction | Performance cliff at ~50 notes; no granular loading | Never -- granular storage costs minutes to implement upfront |
| Skipping write debouncing | Every keystroke is saved | Storage API thrashing; potential for write conflicts and performance lag | Only during early prototyping, fix before any user testing |
| Hardcoding dark theme colors | Ship faster without theme system | Inconsistent colors across components; impossible to add themes later | Acceptable for v1 if CSS custom properties are used (zero cost to do right) |
| No error boundaries in React | Faster initial development | One broken note crashes the entire new tab page | Never -- an error boundary around the editor is essential from day one |
| Synchronous storage reads on startup | Simpler initialization code | Blocks rendering; new tab page feels slow | Never -- always async with skeleton UI |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| chrome.storage.local | Not handling `runtime.lastError` or rejected promises | Always check for errors; implement retry logic for transient failures |
| chrome.storage.local | Storing circular references or non-serializable objects | All data must be JSON-serializable; test serialization in unit tests |
| Tiptap extensions | Loading all extensions synchronously at startup | Lazy-load non-essential extensions; use dynamic `import()` |
| ProseMirror transactions | Calling editor commands inside `onUpdate` hooks | Use `requestAnimationFrame` or transaction appendage to avoid infinite loops |
| Chrome new tab override | Not setting a page `<title>` | Always set `<title>` -- without it Chrome shows the raw extension URL |
| Whiteboard (Excalidraw/tldraw) | Bundling the entire library in the main chunk | Code-split the whiteboard; load only when the user opens the whiteboard view |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Full-document re-render on every edit | Typing lag, dropped keystrokes | Use Tiptap's `shouldRerenderOnTransaction` option; isolate editor in its own React component | Documents exceeding ~5,000 words |
| Loading all notes into memory at startup | Slow new tab, high memory usage | Load only the tree index on startup; load note content on demand | 50+ notes with rich content |
| Uncompressed image embeds in storage | Storage quota hit quickly; slow serialization | Convert images to compressed data URIs or store as blobs in IndexedDB | 10+ embedded images |
| Full-text search scanning all note content | Search takes seconds, blocks UI | Build and maintain a search index (inverted index of terms to note IDs); update incrementally on save | 100+ notes |
| Re-initializing Tiptap editor on every page navigation | Flash of empty editor, lost cursor position | Keep one editor instance alive; swap document content using `editor.commands.setContent()` | Noticeable from the first page switch |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Rendering user-pasted HTML without sanitization | XSS via pasted content from malicious pages | Tiptap/ProseMirror sanitizes through schema by default -- do not bypass with `dangerouslySetInnerHTML` or raw HTML injection |
| Storing sensitive data (passwords, keys) in notes without warning | Data is accessible to any extension with `chrome.storage` access or anyone with physical device access | Document that notes are unencrypted local storage; do not offer "password" or "secret" note types without encryption |
| Requesting unnecessary permissions | Users reject installation; Chrome Web Store review flags | Request only `storage`, `unlimitedStorage`, and `activeTab` (if needed). Do not request `tabs`, `history`, or `<all_urls>` |
| Loading external resources (fonts, images, scripts) from CDNs | Tracking risk; breaks offline; CSP violations | Bundle all assets locally within the extension; do not depend on external CDNs |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No keyboard shortcut for quick capture | Users must click through UI to jot a thought -- kills the "new tab = instant capture" value | Bind a global shortcut (e.g., `/` to focus editor, `Cmd+K` for command palette) immediately on new tab open |
| Editor takes focus automatically on every new tab | Users who open new tabs to type a URL find themselves typing into the editor instead | Do NOT auto-focus the editor. Let Chrome's address bar keep focus. Provide a visible click target or shortcut to enter the editor. |
| No visual feedback during storage operations | Users do not know if their note saved; anxiety about data loss | Show a subtle "Saved" indicator (timestamp or checkmark) that updates after each successful write |
| Sidebar navigation requires too many clicks | Finding a deeply nested note is frustrating | Implement breadcrumbs, recent notes list, and Cmd+K search early -- not as "nice to have" but as core navigation |
| Modal overload for settings and actions | Every action pops a modal; feels like a web app, not a native tool | Use inline editing, context menus, and the command palette instead of modals wherever possible |

## "Looks Done But Isn't" Checklist

- [ ] **Rich text editor:** Often missing undo/redo across sessions -- verify that undo history persists or resets gracefully on reopen
- [ ] **Nested pages:** Often missing orphan cleanup -- verify that deleting a parent page handles or reassigns children
- [ ] **Backlinks:** Often missing broken link detection -- verify that deleting a linked note updates or marks the backlink as broken
- [ ] **Search:** Often missing search index updates -- verify that editing a note updates the search index, not just on creation
- [ ] **Todos:** Often missing persistence of checkbox state when embedded in a note -- verify that checking a box triggers a storage write
- [ ] **Import/Export:** Often missing round-trip fidelity -- verify that exporting and re-importing produces identical content
- [ ] **Trash/Recovery:** Often missing automatic cleanup after 30 days -- verify that a cleanup job actually runs
- [ ] **Keyboard shortcuts:** Often missing conflict detection with Chrome shortcuts -- verify that `Cmd+T`, `Cmd+W`, `Cmd+L` are NOT overridden
- [ ] **Dark theme:** Often missing scrollbar styling and focus ring colors -- verify that every interactive element matches the dark theme

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Data loss from storage corruption | HIGH | Implement emergency recovery: scan IndexedDB backup, check for exported JSON files, provide "import from backup" flow |
| Schema migration breaks content | MEDIUM | Keep the raw JSON of every note version; write a repair tool that re-applies migrations; add a "report broken note" button |
| Performance cliff at scale | MEDIUM | Introduce storage abstraction layer; migrate to granular key-per-note storage; add lazy loading. Can be done incrementally. |
| CSP-blocked features discovered late | LOW | Replace the offending library with a CSP-compatible alternative; this is usually a swap, not a rewrite |
| Editor auto-focus stealing URL bar | LOW | Remove `autoFocus` prop; add click-to-focus behavior. Simple fix but causes user frustration if not caught early. |
| Over-scoped MVP never ships | HIGH | Cut scope ruthlessly. Archive unfinished feature branches. Ship what works. Revisit features based on user feedback. |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Giant storage object | Phase 1: Storage Architecture | Load test with 200 notes; measure new tab open time |
| Editor blocking first paint | Phase 1: Editor Setup | Time-to-interactive < 300ms with production build in extension context |
| Naive tree data model | Phase 1: Data Model | Breadcrumbs, move, and delete operations work without loading all notes |
| Data loss / no backup | Phase 1: Storage Layer | Simulate `chrome.storage` failure; verify error handling and recovery prompt |
| CSP blocking features | Phase 1: Dev Environment | All development and testing happens in actual extension context |
| Schema migration / content loss | Phase 2: Editor Extensions | Save a note with v1 schema, upgrade to v2, verify content integrity |
| Over-scoping | All Phases | Phase gate reviews; no feature work beyond current phase scope |
| Editor auto-focus stealing URL bar | Phase 1: New Tab Setup | Open new tab, immediately type a URL -- verify it goes to address bar |
| Performance at scale | Phase 3+: Scale Testing | Load test with 500 notes, 20 with embedded images; measure all operations |

## Sources

- [Chrome Storage API Documentation](https://developer.chrome.com/docs/extensions/reference/api/storage) -- storage limits, async behavior, `unlimitedStorage` permission
- [Override Chrome Pages](https://developer.chrome.com/docs/extensions/develop/ui/override-chrome-pages) -- new tab override requirements and UX guidance
- [Chrome Extension CSP](https://developer.chrome.com/docs/extensions/reference/manifest/content-security-policy) -- Manifest V3 CSP restrictions and minimum requirements
- [Tiptap Performance Guide](https://tiptap.dev/docs/guides/performance) -- rendering optimization, `shouldRerenderOnTransaction`, component isolation
- [Tiptap FAQ](https://tiptap.dev/docs/guides/faq) -- schema validation, content loss, ProseMirror integration gotchas
- [Chromium IndexedDB Storage Improvements](https://developer.chrome.com/docs/chromium/indexeddb-storage-improvements) -- compression, IPC improvements, performance benchmarks
- [Chrome Storage Corruption Bug](https://bugs.chromium.org/p/chromium/issues/detail?id=261623) -- unrecoverable chrome.storage.sync database corruption
- [Corrupted Chrome Storage Discussion](https://groups.google.com/a/chromium.org/g/chromium-extensions/c/NPSzcNvUp8k/m/d8vF4hORTL8J) -- community reports of storage corruption with no recovery
- [chrome.storage.session Performance Discussion](https://groups.google.com/a/chromium.org/g/chromium-extensions/c/_ks4MjNLlN8) -- IPC serialization overhead details
- [BlockNote vs Tiptap](https://tiptap.dev/alternatives/blocknote-vs-tiptap) -- tradeoffs between batteries-included vs. flexible editor approaches

---
*Pitfalls research for: Chrome extension new tab productivity workspace*
*Researched: 2026-03-19*
