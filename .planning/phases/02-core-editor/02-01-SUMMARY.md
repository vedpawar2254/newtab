---
phase: 02-core-editor
plan: 01
subsystem: editor
tags: [tiptap, prosemirror, rich-text, markdown-shortcuts, autosave, schema-versioning]

# Dependency graph
requires:
  - phase: 01-foundation-app-shell
    provides: StorageService, NotesStore, UIStore, MainContent layout, CSS theme tokens
provides:
  - Tiptap editor with StarterKit rich text formatting
  - Markdown shortcuts auto-conversion (headings, bold, lists)
  - Task list / checkbox extension
  - Code block with lowlight syntax highlighting
  - Table extension with resize support
  - Schema versioning for content migration safety
  - Auto-save hook with 300ms debounce
  - Note loader hook for content swapping without editor recreation
  - EditorTitle component with Untitled placeholder
affects: [02-02-bubble-toolbar, 02-03-slash-commands, 02-04-drag-handle, 02-05-code-block-view]

# Tech tracking
tech-stack:
  added: [@tiptap/react, @tiptap/starter-kit, @tiptap/pm, @tiptap/extension-table, @tiptap/extension-task-list, @tiptap/extension-task-item, @tiptap/extension-code-block-lowlight, lowlight, @tiptap/extension-image, @tiptap/extension-placeholder, @tiptap/extension-underline, @tiptap/extension-drag-handle-react, @tiptap/extension-file-handler, tippy.js]
  patterns: [single-editor-instance-with-content-swap, debounced-autosave-via-editor-update, schema-versioned-content-storage, createExtensions-registry-pattern]

key-files:
  created: [lib/editor/extensions.ts, lib/editor/schema-migrations.ts, lib/hooks/use-editor-autosave.ts, lib/hooks/use-note-loader.ts, components/editor/Editor.tsx, components/editor/EditorTitle.tsx]
  modified: [entrypoints/newtab/style.css, components/layout/MainContent.tsx, components/layout/AppShell.tsx, entrypoints/newtab/App.tsx, package.json]

key-decisions:
  - "Use named exports from @tiptap/extension-table which bundles Table, TableRow, TableCell, TableHeader"
  - "Keep single editor instance alive and swap content via setContent on note switch"
  - "300ms debounce in autosave hook in addition to StorageService debounce to avoid excessive serialization"
  - "Auto-create first note on initial load so editor is immediately visible"

patterns-established:
  - "createExtensions() registry: centralized extension configuration in lib/editor/extensions.ts"
  - "Schema versioning wrapper: serializeContent/deserializeContent wraps content with schemaVersion for safe migration"
  - "Editor hooks pattern: useEditorAutosave and useNoteLoader as composable hooks wired into Editor component"

requirements-completed: [EDIT-01, EDIT-02, EDIT-03, EDIT-04, EDIT-05, EDIT-12]

# Metrics
duration: 6min
completed: 2026-03-18
---

# Phase 2 Plan 1: Tiptap Editor Foundation Summary

**Tiptap v3 editor with StarterKit rich text, markdown shortcuts, task lists, tables, syntax-highlighted code blocks, schema-versioned autosave to IndexedDB, and dedicated title field**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-18T20:12:19Z
- **Completed:** 2026-03-18T20:19:12Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments
- Installed all Tiptap dependencies and configured ProseMirror CSS styles with syntax highlighting tokens
- Built extension registry with StarterKit, CodeBlockLowlight, Table, TaskList, Image, Placeholder, and Underline
- Created schema versioning system for safe content migration with serializeContent/deserializeContent
- Built autosave hook with 300ms debounce persisting editor content through notes store
- Built note loader hook that swaps content without recreating the editor instance
- Created Editor and EditorTitle components wired into the app shell
- Auto-creates first note on initial load for immediate editor visibility

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Tiptap dependencies and add CSS theme tokens** - `bc2cdfc` (feat)
2. **Task 2: Create extension registry, schema migrations, and editor hooks** - `6be942b` (feat)
3. **Task 3: Create Editor and EditorTitle components, wire into App** - `c7f2e18` (feat)

## Files Created/Modified
- `lib/editor/extensions.ts` - Configured Tiptap extension array with createExtensions()
- `lib/editor/schema-migrations.ts` - Schema versioning with serialize/deserialize and migration chain
- `lib/hooks/use-editor-autosave.ts` - Debounced auto-save hook wiring editor to NotesStore
- `lib/hooks/use-note-loader.ts` - Hook to load note content into editor on note switch
- `components/editor/Editor.tsx` - Main Tiptap editor wrapper with useEditor and EditorContent
- `components/editor/EditorTitle.tsx` - Dedicated title input field with Untitled placeholder
- `components/layout/MainContent.tsx` - Updated to accept and render editor prop
- `components/layout/AppShell.tsx` - Updated to pass Editor component to MainContent
- `entrypoints/newtab/App.tsx` - Auto-create/select note on first load
- `entrypoints/newtab/style.css` - Phase 2 CSS tokens, ProseMirror styles, syntax highlighting

## Decisions Made
- Used named exports from @tiptap/extension-table which bundles all table sub-extensions (Table, TableRow, TableCell, TableHeader) in a single package
- Kept single editor instance alive across note switches (content swap via setContent, not recreation)
- Added 300ms debounce in the autosave hook to avoid excessive JSON serialization on every keystroke
- Editor wired through AppShell rather than directly in App.tsx to maintain clean component hierarchy

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed @tiptap/extension-table import (no default export)**
- **Found during:** Task 3 (build verification)
- **Issue:** Table extension uses named exports only, default import caused build failure
- **Fix:** Changed to named import `{ Table, TableRow, TableCell, TableHeader }` from '@tiptap/extension-table'
- **Files modified:** lib/editor/extensions.ts
- **Verification:** npm run build succeeds
- **Committed in:** c7f2e18 (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Auto-fix necessary for build to succeed. No scope creep.

## Issues Encountered
- Package.json already contained Tiptap dependencies from prior planning phase commits; npm install installed them from lockfile

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Editor foundation complete with all core extensions registered
- Ready for Plan 02-02 (bubble toolbar), 02-03 (slash commands), 02-04 (drag handle), 02-05 (code block NodeView)
- All hooks (autosave, note loader) tested via successful build

---
*Phase: 02-core-editor*
*Completed: 2026-03-18*
