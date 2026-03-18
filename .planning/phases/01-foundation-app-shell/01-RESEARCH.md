# Phase 1: Foundation + App Shell - Research

**Researched:** 2026-03-19
**Domain:** Chrome Extension MV3 scaffold, IndexedDB storage, React app shell, dark theme
**Confidence:** HIGH

## Summary

Phase 1 creates the foundation that all subsequent phases depend on: a working Chrome extension (Manifest V3) that overrides the new tab page, loads in under 500ms, persists data via Dexie.js/IndexedDB with granular key-per-note storage, and renders a dark-themed notes-first shell with a collapsible sidebar. This is a greenfield project -- no existing code, no package.json, no src directory. Everything must be scaffolded from scratch.

The core technologies are WXT v0.20 (extension framework built on Vite 6), React 19, Dexie.js v4.3 (IndexedDB), Zustand v5 (state management), and Tailwind CSS v4.2 (styling). WXT handles manifest generation, HMR, and entrypoint routing automatically via its file-based convention -- a `entrypoints/newtab/` directory automatically creates a new tab override. The storage layer is the most critical architectural decision in this phase: it must use granular `note:{id}` keys from day one, with a lightweight tree index object, because migrating from a single-blob storage model after user data exists is prohibitively expensive (Pitfall #1 from PITFALLS.md).

The UI spec is fully defined in the approved 01-UI-SPEC.md, including exact color tokens, typography, spacing, animation contracts, skeleton UI, toast notifications, and save status indicators. The implementation must follow this spec precisely -- all Tailwind theme tokens, JetBrains Mono font loading, and component behaviors are locked.

**Primary recommendation:** Scaffold with WXT + React template, implement Dexie.js storage service with write-through cache and 300ms debounce, build the app shell with sidebar per UI-SPEC, and validate everything loads within the extension context (not just Vite dev server) from day one.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Warm dark grays (Notion-dark tone) -- background range #191919-#2f2f2f
- Blue accent color (#5B9BD5 range) for interactive elements, links, active states
- Monospace-first typography (JetBrains Mono or system monospace) for all UI and future editor
- Subtle 1px borders with slight opacity, flat surfaces -- no shadows or elevation
- Consistent dark palette across all surfaces -- sidebar, main content, header, toasts
- Sidebar slides in/out pushing main content (200-300ms animation, Notion-style)
- Default sidebar width: 240px
- Sidebar open by default on new tab
- Subtle "Saved" status text that appears briefly after auto-save, then fades (Notion-style)
- Skeleton UI for initial shell render -- animated skeleton placeholders for sidebar and content while data loads
- Toast notifications for errors -- non-blocking, bottom-right, auto-dismiss after a few seconds
- Auto-save with 300ms debounce after user stops typing
- Warning toast at 80% storage capacity
- Phase 1 builds storage abstraction and API only -- no user-facing data management UI

### Claude's Discretion
- Main content area placeholder/empty state design (before editor exists in Phase 2)
- Exact monospace font choice (JetBrains Mono vs Fira Code vs system monospace)
- Skeleton UI animation details (pulse vs shimmer)
- Toast notification positioning and timing specifics
- Exact color values within the warm dark gray + blue accent palette

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUND-01 | Extension loads new tab page in under 500ms to interactive | WXT scaffold with Vite 6 provides fast builds; skeleton UI renders instantly; lazy-load patterns for heavy deps; no editor in this phase keeps bundle minimal |
| FOUND-02 | All data persists in local storage (Dexie.js/IndexedDB) until user deletes it | Dexie.js v4.3 provides structured IndexedDB wrapper with schema versioning, bulk operations, and persistence guarantees |
| FOUND-03 | Storage uses granular key-per-note architecture with tree index | Dexie.js table schema with per-note rows + lightweight tree index object; `note:{id}` pattern via Dexie table design |
| FOUND-04 | Dark theme applied globally as the only theme | Tailwind CSS v4.2 CSS-first theme configuration with custom properties; UI-SPEC provides complete color token set |
| FOUND-05 | Extension uses Chrome Manifest V3 with `unlimitedStorage` permission | WXT auto-generates manifest; permissions configured in wxt.config.ts; `unlimitedStorage` removes 10MB cap on chrome.storage.local |
| FOUND-06 | UI animations and transitions feel smooth and premium (Notion-comparable) | UI-SPEC animation contract with specific durations, easings; CSS transitions for sidebar, toasts, skeleton shimmer; `prefers-reduced-motion` respected |
| PAGE-07 | Notes-first layout with full editor center stage and sidebar for navigation | App shell layout: 240px sidebar + fluid main content area (max 720px centered); empty state placeholder until editor arrives in Phase 2 |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| WXT | 0.20.20 | Chrome extension framework | Auto-generates MV3 manifest, provides HMR, file-based entrypoints, React module support. Leading extension framework in 2025-2026 |
| React | 19.2.4 | UI framework | Required by all downstream dependencies (BlockNote, tldraw, cmdk). Industry standard for component-driven UIs |
| TypeScript | ^5.7 | Type safety | Non-negotiable for storage models, extension APIs, component props |
| Dexie.js | 4.3.0 | IndexedDB wrapper | Structured queries, schema versioning with `db.version().stores()`, bulk operations. Far superior to raw chrome.storage.local for note content |
| Zustand | 5.0.12 | State management | 3KB bundle, zero boilerplate, works outside React (useful for storage service). Single-store model fits new tab app |
| Tailwind CSS | 4.2.2 | Styling | CSS-first configuration (no tailwind.config.js). Design tokens via `@theme` block. Ideal for dark-theme-only UI |
| @tailwindcss/vite | 4.2.2 | Vite plugin for Tailwind | Required for Tailwind v4 integration with Vite/WXT build pipeline |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @wxt-dev/module-react | latest | WXT React module | Required for React support in WXT -- provides JSX transform, React refresh |
| lucide-react | 0.577.0 | Icons | Sidebar toggle (PanelLeftClose/PanelLeft), toast icons (Info, Check, AlertTriangle), empty state (FileText) |
| @radix-ui/react-dialog | 1.1.15 | Dialog primitives | Future-phase dependency; install now for consistency. Not used in Phase 1 directly |
| @radix-ui/react-tooltip | 1.2.8 | Tooltip primitives | Sidebar toggle button tooltip. Accessible, unstyled, pairs with Tailwind |

### Development

| Library | Version | Purpose |
|---------|---------|---------|
| Vitest | 4.1.0 | Unit/integration testing |
| @testing-library/react | 16.3.2 | React component testing |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Dexie.js | chrome.storage.local only | chrome.storage.local is fine for small settings (<10KB) but too slow for note content at scale due to IPC serialization overhead. Use chrome.storage.local only for sidebar-open state, last-viewed note ID |
| Zustand | Jotai | Jotai is atom-based (good for scattered state). Zustand's single-store model is better here where state is interconnected (notes, pages, UI) |
| WXT | Plasmo | Plasmo is more opinionated and uses its own build system rather than Vite. WXT is more flexible and community-preferred |

**Installation:**
```bash
# Scaffold with WXT
npx wxt@latest init newtab --template react

# Core dependencies
npm install dexie zustand

# UI
npm install lucide-react @radix-ui/react-tooltip

# Styling
npm install -D tailwindcss @tailwindcss/vite

# Testing
npm install -D vitest @testing-library/react
```

## Architecture Patterns

### Recommended Project Structure

```
entrypoints/
  newtab/
    index.html          # HTML shell with <div id="root"> and <script type="module" src="./main.tsx">
    main.tsx            # createRoot + render <App />
    App.tsx             # Main app component with layout shell
    style.css           # Global styles with @import "tailwindcss" and @theme block
components/
  layout/
    AppShell.tsx        # Sidebar + main content area layout
    Sidebar.tsx         # Collapsible sidebar with toggle
    SidebarToggle.tsx   # Toggle button component
    MainContent.tsx     # Main content area with empty state
  feedback/
    Toast.tsx           # Toast notification component
    ToastContainer.tsx  # Toast stack manager
    SaveStatus.tsx      # "Saved" fade indicator
  skeleton/
    SidebarSkeleton.tsx # Skeleton placeholder for sidebar
    ContentSkeleton.tsx # Skeleton placeholder for content area
lib/
  storage/
    db.ts               # Dexie database class definition and schema
    storage-service.ts  # Write-through cache + debounce abstraction
    types.ts            # Storage type definitions (Note, PageTreeIndex, etc.)
  stores/
    ui-store.ts         # Zustand store for UI state (sidebar open, active note ID)
    notes-store.ts      # Zustand store for notes data (tree index, note cache)
  utils/
    debounce.ts         # Debounce utility for auto-save
hooks/
  useToast.ts           # Toast notification hook
  useSidebarToggle.ts   # Sidebar state hook with keyboard shortcut
public/
  icon/                 # Extension icons (16, 32, 48, 128px)
wxt.config.ts           # WXT configuration with manifest permissions
```

### Pattern 1: WXT Newtab Entrypoint

**What:** WXT uses file-based entrypoint discovery. A `entrypoints/newtab/` directory automatically creates a new tab override in the generated manifest.

**When to use:** Always -- this is the only way to define a newtab override in WXT.

**Example:**

```html
<!-- entrypoints/newtab/index.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NewTab</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.tsx"></script>
  </body>
</html>
```

```typescript
// entrypoints/newtab/main.tsx
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './style.css';

createRoot(document.getElementById('root')!).render(<App />);
```

**Source:** [WXT Entrypoints Documentation](https://wxt.dev/guide/essentials/entrypoints.html)

### Pattern 2: WXT Manifest Configuration

**What:** WXT config file declares permissions and manifest properties.

**Example:**

```typescript
// wxt.config.ts
import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'NewTab',
    description: 'Notion-level productivity in every new tab',
    permissions: ['storage', 'unlimitedStorage'],
  },
});
```

**Source:** [WXT Manifest Configuration](https://wxt.dev/guide/essentials/config/manifest)

### Pattern 3: Dexie.js Database with Schema Versioning

**What:** Define the database with typed tables and explicit schema versions. Each version can include an upgrade function for data migration.

**Example:**

```typescript
// lib/storage/db.ts
import Dexie, { type EntityTable } from 'dexie';

export interface NoteRecord {
  id: string;
  title: string;
  content: string; // JSON string (Tiptap JSON in Phase 2+, empty in Phase 1)
  parentId: string | null;
  order: number;
  createdAt: number;
  updatedAt: number;
  schemaVersion: number;
}

export interface TreeIndexRecord {
  id: 'tree-index'; // singleton
  entries: Array<{
    id: string;
    title: string;
    parentId: string | null;
    childIds: string[];
    order: number;
    path: string[];
  }>;
  updatedAt: number;
}

export interface SettingsRecord {
  key: string;
  value: unknown;
}

class NewTabDB extends Dexie {
  notes!: EntityTable<NoteRecord, 'id'>;
  settings!: EntityTable<SettingsRecord, 'key'>;

  constructor() {
    super('newtab-db');
    this.version(1).stores({
      notes: 'id, parentId, updatedAt',
      settings: 'key',
    });
  }
}

export const db = new NewTabDB();
```

**Source:** [Dexie.js Documentation](https://dexie.org/)

### Pattern 4: Storage Service with Write-Through Cache and Debounce

**What:** An abstraction layer over Dexie.js that provides cached reads, debounced writes, and error handling. All stores go through this service -- never call Dexie directly from components.

**Example:**

```typescript
// lib/storage/storage-service.ts
import { db, type NoteRecord } from './db';

class StorageService {
  private noteCache = new Map<string, NoteRecord>();
  private writeTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly DEBOUNCE_MS = 300;

  async loadNote(id: string): Promise<NoteRecord | undefined> {
    const cached = this.noteCache.get(id);
    if (cached) return cached;

    try {
      const note = await db.notes.get(id);
      if (note) this.noteCache.set(id, note);
      return note;
    } catch (err) {
      console.error(`Failed to load note ${id}:`, err);
      throw err;
    }
  }

  saveNote(note: NoteRecord): void {
    // Update cache immediately (write-through)
    this.noteCache.set(note.id, { ...note, updatedAt: Date.now() });

    // Debounce the actual write
    const existing = this.writeTimers.get(note.id);
    if (existing) clearTimeout(existing);

    this.writeTimers.set(
      note.id,
      setTimeout(async () => {
        try {
          await db.notes.put(this.noteCache.get(note.id)!);
          this.writeTimers.delete(note.id);
          // Emit save success event for UI indicator
        } catch (err) {
          console.error(`Failed to save note ${note.id}:`, err);
          // Emit save failure event for error toast
        }
      }, this.DEBOUNCE_MS)
    );
  }

  async getStorageUsage(): Promise<{ used: number; quota: number; percent: number }> {
    const estimate = await navigator.storage.estimate();
    const used = estimate.usage ?? 0;
    const quota = estimate.quota ?? 0;
    return { used, quota, percent: quota > 0 ? (used / quota) * 100 : 0 };
  }
}

export const storageService = new StorageService();
```

### Pattern 5: Zustand Store with Storage Service Integration

**What:** Zustand stores manage React-facing state and delegate persistence to the StorageService.

**Example:**

```typescript
// lib/stores/ui-store.ts
import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  activeNoteId: string | null;
  toggleSidebar: () => void;
  setActiveNote: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeNoteId: null,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActiveNote: (id) => set({ activeNoteId: id }),
}));
```

### Pattern 6: Tailwind v4 CSS-First Theme (from UI-SPEC)

**What:** Define all design tokens in CSS using Tailwind v4's `@theme` directive. No `tailwind.config.js` file needed.

**Example:**

```css
/* entrypoints/newtab/style.css */
@import "tailwindcss";

@theme {
  --color-bg: #191919;
  --color-surface: #252525;
  --color-surface-elevated: #2F2F2F;
  --color-accent: #5B9BD5;
  --color-destructive: #E5484D;
  --color-success: #30A46C;
  --color-warning: #F5A623;
  --color-text-primary: #ECECEC;
  --color-text-secondary: rgba(255, 255, 255, 0.50);
  --color-border: rgba(255, 255, 255, 0.08);
  --color-border-strong: rgba(255, 255, 255, 0.12);

  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;

  --spacing-sidebar: 240px;
}
```

**Source:** [01-UI-SPEC.md Tailwind CSS v4 Tokens section]

### Anti-Patterns to Avoid

- **Storing all notes in one Dexie table row or one chrome.storage key:** Use one row per note in the Dexie `notes` table. Load content on demand, not all at startup.
- **Calling Dexie directly from components:** All storage access goes through StorageService. This enables caching, debouncing, and error handling in one place.
- **Auto-focusing the editor/content area on new tab:** Chrome new tab pages must NOT steal focus from the address bar. Users open new tabs to type URLs. Never use `autoFocus`.
- **Loading Google Fonts from CDN at runtime in extension:** Bundle the font files locally or use `font-display: swap` with preconnect to minimize FOIT. CSP may block external font loading -- test in extension context.
- **Synchronous initialization blocking render:** Always render skeleton UI immediately, hydrate with data asynchronously.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| IndexedDB operations | Raw IndexedDB API | Dexie.js v4.3 | IndexedDB API is callback-based, verbose, and error-prone. Dexie wraps it cleanly with promises, schema versioning, and bulk operations |
| State management | Context + useReducer | Zustand v5 | Zustand provides subscription-based updates without re-rendering entire trees, works outside React, and persists state trivially |
| Design tokens | CSS variables manually | Tailwind v4 @theme | Tailwind generates utility classes from tokens, enforces consistency, and enables responsive/state variants |
| Toast notifications | Custom from scratch | Build minimal toast system, then migrate to sonner in Phase 2+ if needed | Phase 1 needs only 3-4 toast variants; a 50-line component suffices. Don't add a library for 4 toasts |
| Debounce | Custom debounce function | Write a simple 15-line debounce utility | Lodash/debounce adds unnecessary bundle weight for a single utility. Keep it local |
| Icons | SVG files or font-awesome | lucide-react | Tree-shakeable, consistent design, tiny per-icon bundle cost |

## Common Pitfalls

### Pitfall 1: Giant Storage Blob (CRITICAL -- Phase 1)
**What goes wrong:** Storing all notes as a single JSON blob in one key. Works with 5 notes, causes 2-5 second new tab load at 50+ notes due to IPC serialization overhead in chrome.storage.local.
**Why it happens:** Simple key-value APIs encourage dumping everything in one key.
**How to avoid:** Use Dexie.js with one table row per note. Keep a lightweight tree index separate from note content. Load content lazily (only when user opens a note).
**Warning signs:** `chrome.storage.local.getBytesInUse()` approaching megabytes for a handful of notes.

### Pitfall 2: No Error Handling on Storage Operations
**What goes wrong:** chrome.storage.local and IndexedDB can fail silently (quota errors, LevelDB corruption, disk errors). Users lose notes with no warning.
**Why it happens:** Developers treat browser storage as reliable. It is not -- Chromium bug tracker has unresolved corruption issues.
**How to avoid:** Wrap every Dexie operation in try/catch. Show error toasts on failure. Implement a "Saved" indicator that confirms successful writes. Consider periodic backup export.
**Warning signs:** No error handling in storage code; no UI feedback on save.

### Pitfall 3: Editor Auto-Focus Stealing Address Bar
**What goes wrong:** Adding `autoFocus` to any input/textarea causes new tab to focus the extension content instead of Chrome's address bar. Users type URLs into the note editor.
**Why it happens:** Developers think "the editor is the core feature, it should be focused."
**How to avoid:** Never use `autoFocus` on the new tab page. Let Chrome's address bar keep focus. Provide a visible click target to enter the content area.
**Warning signs:** Open new tab, immediately type a URL -- if it goes into the extension content, this is broken.

### Pitfall 4: CSP Violations in Extension Context
**What goes wrong:** Features work in Vite dev server but fail when loaded as an actual Chrome extension. MV3 enforces `script-src 'self'` -- no eval(), no inline scripts, no dynamic code generation.
**Why it happens:** Development happens in browser context (Vite dev server) where CSP is not enforced.
**How to avoid:** Build and load the extension in Chrome from day one. Test every feature in the extension context, not just the dev server. Audit dependencies for eval() usage.
**Warning signs:** Console errors: "Refused to evaluate a string as JavaScript."

### Pitfall 5: Google Fonts Loading Delay
**What goes wrong:** Loading JetBrains Mono from Google Fonts CDN adds 100-200ms to first paint. CSP may also block external font loading in extension context.
**Why it happens:** Developers use CDN fonts in dev without considering extension constraints.
**How to avoid:** Use `font-display: swap` so text renders immediately with fallback font, then swaps when JetBrains Mono loads. Better: bundle the font files (.woff2) directly in the extension's `public/` directory. This eliminates the network request entirely.
**Warning signs:** FOIT (Flash of Invisible Text) on new tab open; font loading adding >100ms to interactive time.

### Pitfall 6: Sidebar Animation Janking on Low-End Machines
**What goes wrong:** Using `width` or `left` for sidebar animation triggers layout reflow. Animation is smooth on dev machine but janky on low-end Chromebooks.
**Why it happens:** CSS layout properties (width, left, margin-left) trigger reflow. Only `transform` and `opacity` are GPU-composited.
**How to avoid:** Use `transform: translateX()` for the sidebar slide animation (as specified in UI-SPEC). The main content area should also shift via `margin-left` transition or flex layout, but the sidebar itself must use transform.
**Warning signs:** DevTools Performance tab showing layout thrashing during sidebar toggle.

## Code Examples

### Sidebar Toggle with Keyboard Shortcut

```typescript
// hooks/useSidebarToggle.ts
import { useEffect } from 'react';
import { useUIStore } from '../lib/stores/ui-store';

export function useSidebarToggle() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [toggleSidebar]);

  return { sidebarOpen, toggleSidebar };
}
```

### Skeleton Shimmer Animation (CSS)

```css
/* Skeleton shimmer per UI-SPEC */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-surface) 25%,
    var(--color-surface-elevated) 50%,
    var(--color-surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s linear infinite;
  border-radius: 4px;
}
```

### Toast Component Structure

```typescript
// components/feedback/Toast.tsx
import { Info, Check, AlertTriangle } from 'lucide-react';

type ToastVariant = 'info' | 'success' | 'error' | 'warning';

interface ToastProps {
  message: string;
  variant: ToastVariant;
  onDismiss: () => void;
}

const icons: Record<ToastVariant, React.ComponentType<{ size: number }>> = {
  info: Info,
  success: Check,
  error: AlertTriangle,
  warning: AlertTriangle,
};

const iconColors: Record<ToastVariant, string> = {
  info: 'text-accent',
  success: 'text-success',
  error: 'text-destructive',
  warning: 'text-warning',
};

export function Toast({ message, variant, onDismiss }: ToastProps) {
  const Icon = icons[variant];
  return (
    <div className="flex items-center gap-sm bg-surface border border-border-strong rounded-lg px-md py-[12px] max-w-[320px] text-[12px] text-text-primary animate-toast-enter">
      <Icon size={16} className={iconColors[variant]} />
      <span>{message}</span>
    </div>
  );
}
```

### React Error Boundary

```typescript
// components/ErrorBoundary.tsx
import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex items-center justify-center h-screen bg-bg text-text-secondary">
          Something went wrong. Try reopening this tab.
        </div>
      );
    }
    return this.props.children;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tailwind.config.js | CSS-first @theme in v4 | Tailwind v4 (2025) | No config file needed; tokens defined in CSS directly |
| CRXJS Vite Plugin | WXT framework | 2024-2025 | CRXJS has uncertain maintenance; WXT is the community standard |
| chrome.storage.local for all data | Dexie.js (IndexedDB) for content, chrome.storage.local for settings only | Ongoing best practice | IndexedDB handles structured data with less IPC overhead; schema versioning built in |
| Manifest V2 | Manifest V3 | Chrome enforced 2024 | Service workers instead of background pages; stricter CSP |
| Zustand v4 | Zustand v5 | 2024 | Framework-agnostic core; React bindings included; same API |

## Open Questions

1. **Google Fonts CSP in extension context**
   - What we know: MV3 enforces `script-src 'self'` but font loading uses `font-src` which may allow external origins
   - What's unclear: Whether Google Fonts CSS/WOFF2 loading is blocked by default CSP in MV3 extension pages
   - Recommendation: Bundle JetBrains Mono .woff2 files locally in `public/fonts/` to eliminate the question entirely. Self-hosting is faster and CSP-safe.

2. **unlimitedStorage actual quota behavior**
   - What we know: `unlimitedStorage` permission removes the 10MB cap on chrome.storage.local. IndexedDB with `unlimitedStorage` gets essentially unlimited space.
   - What's unclear: Whether disk-level quota errors can still occur and what error shape they have
   - Recommendation: Implement storage usage monitoring via `navigator.storage.estimate()` and show warning toast at 80% of reported quota. Handle errors defensively.

3. **WXT HMR in newtab context**
   - What we know: WXT provides HMR for popup and options pages. Newtab is also an HTML page entrypoint.
   - What's unclear: Whether WXT's HMR works reliably when the newtab page is opened as `chrome://newtab` override vs. direct URL
   - Recommendation: During development, use WXT's dev mode which opens the newtab page at a localhost URL with HMR. Test in actual extension context periodically.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | none -- Wave 0 task to create `vitest.config.ts` |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-01 | Extension loads in under 500ms | manual | Manual: Chrome DevTools Performance tab in extension context | N/A |
| FOUND-02 | Data persists in IndexedDB | unit | `npx vitest run tests/storage-service.test.ts -t "persists"` | Wave 0 |
| FOUND-03 | Granular key-per-note storage | unit | `npx vitest run tests/storage-service.test.ts -t "granular"` | Wave 0 |
| FOUND-04 | Dark theme applied globally | manual | Manual: visual inspection of all surfaces | N/A |
| FOUND-05 | MV3 manifest with unlimitedStorage | unit | `npx vitest run tests/manifest.test.ts` | Wave 0 |
| FOUND-06 | Smooth animations | manual | Manual: visual inspection + DevTools Performance | N/A |
| PAGE-07 | Notes-first layout with sidebar | unit | `npx vitest run tests/app-shell.test.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` -- Vitest configuration with jsdom environment
- [ ] `tests/storage-service.test.ts` -- covers FOUND-02, FOUND-03
- [ ] `tests/app-shell.test.ts` -- covers PAGE-07 (sidebar renders, layout structure)
- [ ] `tests/manifest.test.ts` -- covers FOUND-05 (verify generated manifest has correct permissions)
- [ ] Framework install: `npm install -D vitest @testing-library/react jsdom`

## Sources

### Primary (HIGH confidence)
- [WXT Framework](https://wxt.dev/) -- entrypoints, manifest config, React module setup
- [WXT Entrypoints Documentation](https://wxt.dev/guide/essentials/entrypoints.html) -- newtab file convention
- [WXT Manifest Configuration](https://wxt.dev/guide/essentials/config/manifest) -- permissions setup
- [Dexie.js](https://dexie.org/) -- v4.3 schema definition, version().stores() syntax, React hooks
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/api/storage) -- unlimitedStorage, quota behavior
- [01-UI-SPEC.md](./01-UI-SPEC.md) -- complete visual/interaction contract for Phase 1

### Secondary (MEDIUM confidence)
- [WXT React Extension Tutorial (dev.to)](https://dev.to/seryllns_/build-modern-browser-extensions-with-wxt-react-and-typescript-h3h) -- project structure patterns
- [2025 Browser Extension Framework Comparison](https://redreamality.com/blog/the-2025-state-of-browser-extension-frameworks-a-comparative-analysis-of-plasmo-wxt-and-crxjs/) -- WXT vs alternatives

### Tertiary (LOW confidence)
- Google Fonts CSP behavior in MV3 extensions -- needs validation in actual extension context

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages verified against npm registry; versions confirmed current
- Architecture: HIGH -- patterns sourced from WXT docs, Dexie.js docs, and project research (STACK.md, PITFALLS.md)
- Pitfalls: HIGH -- sourced from project PITFALLS.md which references Chromium bug tracker, Chrome extension docs, and Tiptap guides
- UI contract: HIGH -- 01-UI-SPEC.md is approved and fully specified

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (stable stack, 30-day validity)
