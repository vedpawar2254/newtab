# Stack Research

**Domain:** Chrome Extension -- Notion-level New Tab Productivity Workspace
**Researched:** 2026-03-19
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | ^19.0.0 | UI framework | Industry standard for component-driven UIs. Tiptap, BlockNote, tldraw, and cmdk all assume React. No viable alternative given the library ecosystem this project needs. |
| TypeScript | ^5.7 | Type safety | Non-negotiable for a project this complex. Editor schemas, storage models, and extension APIs all benefit from static typing. Catches entire classes of bugs at compile time. |
| WXT | ^0.20 | Chrome extension framework | The leading extension framework in 2025-2026, built on Vite. Provides auto-generated manifest, HMR, TypeScript support, storage helpers, and cross-browser compat out of the box. Replaces CRXJS which has uncertain maintenance. |
| Vite | ^6.0 | Build tool | Underlies WXT. Fast HMR, native ES modules, optimized production builds via Rollup. No configuration needed -- WXT handles it. |
| Tailwind CSS | ^4.0 | Styling | CSS-first configuration in v4 eliminates config files. Utility-first approach is ideal for dark-theme-only UIs -- consistent design tokens, easy to enforce a single palette. Works well with WXT+Vite. |

### Editor Stack

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| BlockNote | ^0.47 | Block-based rich text editor | Notion-style block editor built on Tiptap/ProseMirror. Provides drag-and-drop blocks, slash menus, formatting toolbars, nested blocks, and markdown shortcuts out of the box. Ships much faster than raw Tiptap for Notion-like UX. Tiptap gives more control but requires building every UI element from scratch -- BlockNote is the right abstraction for "Notion-comparable" quality. |
| @blocknote/react | ^0.47 | React bindings for BlockNote | Official React integration. Required alongside @blocknote/core. |
| @blocknote/mantine | ^0.47 | Default UI theme for BlockNote | Provides the default styled components. Can be swapped for @blocknote/shadcn later if desired, but Mantine theme works well out of the box and is easier to dark-theme. |

### Whiteboard

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| tldraw | ^4.3 | Whiteboard / infinite canvas | React-native SDK where every element is a React component. Superior customization over Excalidraw (which is application-first, embed-second). Actively maintained with frequent releases. Canvas-based rendering for shape indicators gives strong performance. |

**Bundle size warning:** tldraw is a large dependency. Lazy-load it -- only import when the user opens the whiteboard view. This is critical for the <500ms new tab load requirement.

### Storage

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Dexie.js | ^4.0 | IndexedDB wrapper | chrome.storage.local has a 10MB limit (even with unlimitedStorage, it's slow for large reads). IndexedDB via Dexie gives structured queries, bulk operations, schema versioning, and handles far more data. Dexie's API is clean, well-maintained, and proven in Chrome extensions. Use chrome.storage.local only for small settings/preferences. |

### State Management

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Zustand | ^5.0 | Global state management | 3KB bundle, minimal boilerplate, works perfectly outside React components (useful for extension messaging). Single-store model fits a new tab app where state is centralized. 20M+ weekly downloads -- battle-tested. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| cmdk | ^1.0 | Command palette (Cmd+K) | Core feature. Headless, accessible, unstyled -- you control the look. Pair with Tailwind for dark-theme styling. |
| FlexSearch | ^0.7 | Full-text search across notes | Needed for "search across all notes." Fastest client-side search library -- handles large datasets without lag. Fuse.js is simpler but too slow for 1000+ notes. |
| date-fns | ^4.0 | Date utilities | Daily journal, habit tracking, pomodoro session timestamps. Tree-shakeable, no Moment.js bloat. |
| react-beautiful-dnd or @hello-pangea/dnd | ^17.0 | Drag and drop for kanban | Kanban board drag-and-drop. @hello-pangea/dnd is the actively maintained fork of react-beautiful-dnd. |
| highlight.js or Shiki | latest | Code block syntax highlighting | BlockNote supports code blocks but needs a highlighter. Shiki is more accurate (uses VS Code grammars), highlight.js is lighter. Recommend Shiki for Notion-level quality, lazy-loaded. |
| react-hotkeys-hook | ^5.0 | Keyboard shortcuts | Global keyboard shortcut management for quick capture, focus mode, navigation. Clean hook-based API. |
| @radix-ui/react-dialog | latest | Modal/dialog primitives | Accessible, unstyled dialog components for settings, confirmations, etc. Pairs perfectly with Tailwind. |
| @radix-ui/react-tooltip | latest | Tooltip primitives | Accessible tooltips throughout the UI. |
| lucide-react | latest | Icons | Clean, consistent icon set. Lighter than heroicons, same visual quality. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint + @typescript-eslint | Linting | Catch errors early. Use flat config (eslint.config.js). |
| Prettier | Code formatting | Consistent code style across parallel development. |
| Vitest | Unit/integration testing | Vite-native test runner. Fast, compatible with WXT build pipeline. |
| Playwright | E2E testing (if needed) | Can test Chrome extensions. Defer to later phases. |

## Installation

```bash
# Scaffold with WXT
npm create wxt@latest newtab -- --template react

# Core framework
npm install react react-dom zustand

# Editor
npm install @blocknote/core @blocknote/react @blocknote/mantine

# Whiteboard (lazy-loaded)
npm install tldraw

# Storage
npm install dexie

# UI utilities
npm install cmdk @radix-ui/react-dialog @radix-ui/react-tooltip
npm install lucide-react react-hotkeys-hook
npm install @hello-pangea/dnd

# Search & utilities
npm install flexsearch date-fns

# Dev dependencies
npm install -D tailwindcss @tailwindcss/vite
npm install -D vitest @testing-library/react
npm install -D eslint @typescript-eslint/eslint-plugin prettier
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| BlockNote | Tiptap (raw) | When you need editor behaviors BlockNote doesn't support (e.g., deeply custom inline widgets). BlockNote is built on Tiptap, so you can drop down to Tiptap APIs when needed -- start with BlockNote, escape-hatch to Tiptap. |
| BlockNote | Novel.sh | When you want AI-powered autocompletions. Novel depends on Vercel AI SDK and a backend -- not suitable for local-only Chrome extension. |
| WXT | CRXJS Vite Plugin | When you want zero abstraction and maximum control over manifest. CRXJS maintenance is uncertain (archival risk). WXT gives you more out of the box. |
| WXT | Plasmo | When you want React-first with built-in CSUI. Plasmo is opinionated and uses its own build system rather than Vite. WXT is more flexible. |
| tldraw | Excalidraw | When you want hand-drawn aesthetic and simpler API. Excalidraw's bundle is 46.8MB (even larger than tldraw). Excalidraw is app-first, harder to embed and customize. tldraw is SDK-first. |
| Dexie.js | chrome.storage.local | For small settings/preferences only (theme toggle, sidebar state). Not for note content -- too slow for bulk reads and limited to ~10MB. |
| Zustand | Jotai | When state is highly atomic and scattered (many independent pieces). Zustand's single-store model is better for this app where most state is interconnected (notes, pages, navigation). |
| FlexSearch | Fuse.js | When you have < 100 items and want fuzzy matching with minimal config. FlexSearch is 1000x faster for the note-search use case. |
| Tailwind CSS | CSS Modules | When you want scoped CSS without utility classes. For a dark-theme-only app, Tailwind's design token system and consistent spacing/color utilities are superior. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Moment.js | 300KB+ bundle, mutable API, deprecated by its own maintainers | date-fns (tree-shakeable, immutable) |
| Redux / Redux Toolkit | Massive boilerplate for a single-user extension. Actions, reducers, selectors -- all unnecessary complexity here. | Zustand (3KB, zero boilerplate) |
| localStorage / Web Storage API | Synchronous, blocks main thread, 5MB limit, no structured queries | Dexie.js (IndexedDB) |
| jQuery | Not 2015. React handles DOM. | React |
| Webpack | Slow builds, complex config. Vite/Rollup is the standard now. | Vite (via WXT) |
| Draft.js | Facebook deprecated it. Unmaintained since 2023. Known bugs, no fixes coming. | BlockNote (Tiptap/ProseMirror) |
| Slate.js | Permanently unstable API, frequent breaking changes, steep learning curve. Community has moved to ProseMirror-based editors. | BlockNote (Tiptap/ProseMirror) |
| CKEditor / TinyMCE | Legacy WYSIWYG editors. Not block-based, not Notion-like. Commercial licensing complexity. | BlockNote |
| react-beautiful-dnd (original) | Unmaintained by Atlassian since 2024. | @hello-pangea/dnd (actively maintained fork) |

## Stack Patterns by Variant

**If BlockNote doesn't support a needed block type (e.g., inline databases, toggle blocks):**
- Use Tiptap's extension API to create custom blocks
- BlockNote exposes its underlying Tiptap editor instance
- This is the intended escape hatch -- you don't need to abandon BlockNote

**If tldraw is too heavy for initial load:**
- Lazy-load with React.lazy() + Suspense
- Only import tldraw when user navigates to whiteboard
- Show a skeleton/placeholder until loaded
- This is mandatory for <500ms new tab load time

**If notes exceed IndexedDB comfort zone (100MB+):**
- Implement pagination/virtualization for note lists
- Use Dexie's built-in pagination with .offset().limit()
- Consider OPFS (Origin Private File System) for large binary attachments

**If you need cross-script communication (background <-> newtab):**
- Use WXT's built-in messaging utilities
- Zustand store lives in the newtab page only
- Background script handles alarms (pomodoro timer) and badge updates

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| WXT ^0.20 | Vite ^6.0, React ^19.0 | WXT manages Vite internally. Use @wxt-dev/module-react for React support. |
| BlockNote ^0.47 | React ^18.0 or ^19.0, Tiptap v3 | BlockNote v0.47 ships with Tiptap v3 internally. Do not install Tiptap separately. |
| tldraw ^4.3 | React ^18.0 or ^19.0 | Verify React 19 compat before upgrading -- check tldraw release notes. |
| Zustand ^5.0 | React ^18.0 or ^19.0 | v5 is framework-agnostic at core, React bindings included. |
| Dexie ^4.0 | Any (no framework dependency) | Pure JS, works anywhere including service workers. |
| Tailwind ^4.0 | Vite ^6.0 | Use @tailwindcss/vite plugin. CSS-first config (no tailwind.config.js). |

## Architecture Note: Why Not a Monorepo?

This is a single Chrome extension. No backend, no shared packages, no multi-platform builds. A monorepo adds complexity with zero benefit. Use a flat src/ structure with clear module boundaries (editor/, whiteboard/, storage/, features/).

## Sources

- [WXT Framework](https://wxt.dev/) -- extension framework docs, v0.20 (HIGH confidence)
- [BlockNote](https://www.blocknotejs.org/) -- v0.47, block editor (HIGH confidence)
- [tldraw SDK](https://tldraw.dev/) -- v4.3, whiteboard SDK (HIGH confidence)
- [Zustand](https://zustand.docs.pmnd.rs/) -- v5.0, state management (HIGH confidence)
- [Dexie.js](https://dexie.org/) -- v4.0, IndexedDB wrapper (HIGH confidence)
- [Tiptap v3 release](https://tiptap.dev/tiptap-editor-v3) -- editor framework underlying BlockNote (HIGH confidence)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/api/storage) -- official docs (HIGH confidence)
- [cmdk](https://github.com/dip/cmdk) -- command palette component (MEDIUM confidence -- version not fully verified)
- [FlexSearch](https://github.com/nextapps-de/flexsearch) -- client-side search (HIGH confidence)
- [Liveblocks editor comparison 2025](https://liveblocks.io/blog/which-rich-text-editor-framework-should-you-choose-in-2025) -- editor landscape survey (MEDIUM confidence)
- [2025 Browser Extension Framework Comparison](https://redreamality.com/blog/the-2025-state-of-browser-extension-frameworks-a-comparative-analysis-of-plasmo-wxt-and-crxjs/) -- WXT vs CRXJS vs Plasmo (MEDIUM confidence)

---
*Stack research for: Chrome Extension -- Notion-level New Tab Productivity Workspace*
*Researched: 2026-03-19*
