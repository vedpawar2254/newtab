# Phase 2: Core Editor - Research

**Researched:** 2026-03-18
**Domain:** Tiptap v3 block editor with React -- rich text, markdown shortcuts, code blocks, tables, images, link embeds, slash commands, drag-and-drop blocks
**Confidence:** HIGH

## Summary

Phase 2 delivers the core value proposition of the entire product: a Notion-quality block editor built on Tiptap v3 (ProseMirror). The user locked Tiptap as the editor framework (not BlockNote as originally suggested in the project-level STACK.md). This means building all UI from scratch -- bubble toolbar, slash command menu, drag handles -- using Tiptap's headless architecture with React components. The trade-off is more control and fewer abstraction boundaries at the cost of more implementation work.

Tiptap v3.20.4 is the current stable release. Its StarterKit already includes bold, italic, underline, strikethrough, code, headings, bullet/ordered lists, blockquote, horizontal rule, link, and code block with built-in markdown input rules (type `# ` to get H1, `**text**` for bold, `- ` for bullet list, etc.). The remaining requirements -- task lists, syntax-highlighted code blocks, tables, images, link embeds, slash commands, and drag handles -- each require separate extension packages. All critical extensions (DragHandle React, FileHandler) were open-sourced under MIT in 2025 and are available on npm at v3.20.4.

The primary risk is schema versioning: every new node/mark type changes the ProseMirror schema, and content saved under one schema can be silently dropped when loaded under a different one. A `schemaVersion` field must be stored with every note from day one. Secondary risks include editor initialization blocking first paint (mitigated by lazy extension loading and keeping a single editor instance alive) and the slash command menu requiring a custom implementation using `@tiptap/suggestion` (there is no official published slash-command extension).

**Primary recommendation:** Use Tiptap v3 StarterKit as foundation, add extensions incrementally (tables, code-block-lowlight, task-list, image, drag-handle-react, file-handler), build slash commands and bubble toolbar as custom React components, store content as Tiptap JSON with schema versioning, and auto-save through the Phase 1 StorageService with 300ms debounce.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Tiptap (built on ProseMirror) as the editor framework -- headless, rich extension ecosystem
- Content stored as Tiptap JSON document format (native ProseMirror JSON)
- Markdown shortcuts convert instantly on typing (Notion-style) -- type `# ` and it becomes H1 immediately, `**text**` converts to bold in place
- Hover drag handles on blocks -- a grip icon appears on the left when hovering, drag to reorder
- Inline floating dropdown for slash commands appears at cursor position when user types `/`
- Block types grouped with category headers (Text, Lists, Media, etc.) in slash menu
- Each slash menu item shows an icon + label for fast visual scanning
- Full keyboard navigation in slash menu: arrow keys to navigate, Enter to select, Esc to dismiss, type to filter
- Inline grid editing for tables -- click any cell to edit, Tab to move between cells
- Add rows/columns via + buttons on table edges
- Language selector dropdown at the top of each code block
- Copy button appears on hover for code blocks
- Images: paste from clipboard, drag-and-drop file, enter URL -- stored as base64 in IndexedDB
- Pasted URLs render as bookmark cards with title, description, and favicon
- Floating bubble toolbar appears above selected text, disappears when nothing selected
- Core formatting: Bold, Italic, Underline, Strikethrough, Code, Link, Heading dropdown (H1/H2/H3)
- No text color or highlight color in v1
- Dedicated title field at top of each note (separate from body)
- Placeholder text: "Type / for commands..." in body, "Untitled" in title field

### Claude's Discretion
- Exact Tiptap extensions and plugin choices
- Syntax highlighting library choice (highlight.js vs Shiki vs other)
- Bookmark card metadata fetching approach (given Chrome extension context)
- Drag handle icon design and positioning details
- Slash menu animation and styling details
- Table resize behavior and min/max column widths
- Image resize controls (if any)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| EDIT-01 | Rich text formatting (bold, italic, underline, strikethrough) | StarterKit includes Bold, Italic, Underline, Strike marks with input rules and keyboard shortcuts |
| EDIT-02 | Markdown shortcuts auto-convert (# heading, **bold**, - list) | StarterKit extensions include built-in input rules that auto-convert markdown syntax on typing |
| EDIT-03 | Headings (H1, H2, H3) via toolbar or markdown shortcuts | StarterKit Heading extension with `levels: [1, 2, 3]` config; input rules for `# `, `## `, `### ` |
| EDIT-04 | Ordered and unordered lists | StarterKit includes BulletList and OrderedList with input rules (`- `, `1. `) |
| EDIT-05 | Checkbox/todo items inside notes | `@tiptap/extension-task-list` + `@tiptap/extension-task-item` -- separate install |
| EDIT-06 | Syntax-highlighted code blocks with language selector | `@tiptap/extension-code-block-lowlight` with `lowlight` library; custom React NodeView for language selector + copy button |
| EDIT-07 | Inline tables (add/remove rows and columns) | `@tiptap/extension-table` (TableKit) with `resizable: true`; custom UI for + buttons on edges |
| EDIT-08 | Embed images inline | `@tiptap/extension-image` with `allowBase64: true`; `@tiptap/extension-file-handler` for paste/drop; convert to base64 for IndexedDB storage |
| EDIT-09 | Link embed preview cards | Custom Tiptap Node extension for bookmark cards; fetch OG metadata via background service worker `fetch()` (Chrome extension context allows cross-origin) |
| EDIT-10 | Drag and reorder blocks | `@tiptap/extension-drag-handle-react` (MIT, open-sourced 2025); provides hover grip icon and drag-to-reorder |
| EDIT-11 | Slash command menu to insert any block type | Custom extension built on `@tiptap/suggestion` utility; renders React component as floating popup |
| EDIT-12 | Keyboard shortcuts for formatting | StarterKit includes Cmd+B (bold), Cmd+I (italic), Cmd+U (underline); additional shortcuts via `addKeyboardShortcuts()` on extensions |
</phase_requirements>

## Standard Stack

### Core (Phase 2 specific)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tiptap/react | 3.20.4 | React bindings for Tiptap editor | Official React integration; provides `useEditor` hook and `EditorContent` component |
| @tiptap/starter-kit | 3.20.4 | Core editor extensions bundle | Includes Bold, Italic, Underline, Strike, Code, Heading, Lists, Blockquote, HorizontalRule, Link, CodeBlock, Document, Paragraph, Text, DropCursor, GapCursor, HardBreak |
| @tiptap/extension-table | 3.20.4 | Inline tables with row/column management | Official TableKit; programmatic addRow/addColumn/deleteRow/deleteColumn commands |
| @tiptap/extension-task-list | 3.20.4 | Checkbox/todo list blocks | Official extension for task lists with toggleable checkboxes |
| @tiptap/extension-task-item | 3.20.4 | Individual checkbox items within task lists | Required companion to task-list extension |
| @tiptap/extension-code-block-lowlight | 3.20.4 | Code blocks with syntax highlighting | Official extension using lowlight for syntax coloring |
| @tiptap/extension-image | 3.20.4 | Image blocks (inline or block-level) | Official; supports base64, resize, alt text |
| @tiptap/extension-placeholder | 3.20.4 | Placeholder text in empty editor | Shows "Type / for commands..." and "Untitled" |
| @tiptap/extension-drag-handle-react | 3.20.4 | Drag handle for block reordering | Official React component; MIT open-sourced 2025; hover-activated grip icon |
| @tiptap/extension-file-handler | 3.20.4 | Handle paste and drop file events | Official; MIT open-sourced 2025; provides onPaste and onDrop callbacks |
| @tiptap/pm | 3.20.4 | ProseMirror core dependencies | Required peer dependency for all Tiptap extensions |
| lowlight | 3.3.0 | Syntax highlighting engine | Used by code-block-lowlight; based on highlight.js grammars; lighter than Shiki, no WASM needed |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | latest | Icons for toolbar, slash menu, drag handle | All editor UI icons (bold icon, italic icon, table icon, etc.) |
| tippy.js | latest | Tooltip/popup positioning for slash menu and bubble toolbar | Position floating UI elements relative to cursor or selection |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| lowlight (highlight.js grammars) | Shiki (VS Code grammars) | Shiki has more accurate highlighting but requires WASM loading, larger bundle (~2MB), and async initialization. lowlight is synchronous, ~200KB, sufficient quality for a notes app. Use lowlight. |
| Custom slash command | @harshtalks/slash-tiptap | Third-party wrapper around @tiptap/suggestion + cmdk. Adds dependency and abstraction for something that's ~150 lines of custom code. Build it custom for full control. |
| Custom bookmark card | No alternative | No Tiptap extension exists for link preview cards. Must be a custom Node extension. |

**Installation:**
```bash
# Editor core
npm install @tiptap/react @tiptap/starter-kit @tiptap/pm

# Additional extensions
npm install @tiptap/extension-table @tiptap/extension-task-list @tiptap/extension-task-item
npm install @tiptap/extension-code-block-lowlight lowlight
npm install @tiptap/extension-image @tiptap/extension-placeholder
npm install @tiptap/extension-drag-handle-react @tiptap/extension-file-handler

# Supporting
npm install lucide-react
```

**Version verification:** All @tiptap packages verified at 3.20.4 via `npm view` on 2026-03-18. lowlight verified at 3.3.0.

## Architecture Patterns

### Recommended Project Structure
```
src/
  components/
    editor/
      Editor.tsx              # Main editor wrapper (useEditor + EditorContent)
      EditorTitle.tsx          # Dedicated title input field (separate from Tiptap body)
      BubbleToolbar.tsx        # Floating formatting toolbar (BubbleMenu component)
      SlashCommandMenu.tsx     # Slash command popup (built on @tiptap/suggestion)
      SlashCommandList.tsx     # Renderable list component for slash menu items
      CodeBlockView.tsx        # Custom NodeView for code blocks (language selector + copy button)
      ImageBlockView.tsx       # Custom NodeView for images (optional resize handles)
      BookmarkCardView.tsx     # Custom NodeView for link embed bookmark cards
      TableControls.tsx        # Row/column + buttons overlay on table edges
      DragHandle.tsx           # Wrapper around @tiptap/extension-drag-handle-react
    editor/extensions/
      slash-command.ts         # Custom Tiptap extension using @tiptap/suggestion
      bookmark-card.ts         # Custom Node extension for link preview cards
      schema-version.ts        # Schema version tracking extension
  lib/
    editor/
      extensions.ts            # Extension registry -- configures and exports all extensions
      slash-items.ts           # Slash command items definition (categories, icons, commands)
      keyboard-shortcuts.ts    # Additional keyboard shortcut bindings
      schema-migrations.ts     # Migration functions: v1_to_v2, etc.
    hooks/
      use-editor-autosave.ts   # Hook: watches editor changes, debounced save to StorageService
      use-note-loader.ts       # Hook: loads note content from storage into editor
```

### Pattern 1: Single Editor Instance with Content Swapping
**What:** Keep one Tiptap editor instance alive for the lifetime of the app. When the user navigates to a different note, swap content using `editor.commands.setContent()` instead of destroying and recreating the editor.
**When to use:** Always. Editor initialization is expensive (ProseMirror parses schema, registers plugins, creates decorations). Recreating on every note switch causes visible flicker.
**Example:**
```typescript
// Source: Tiptap official docs + performance guide
const editor = useEditor({
  extensions: [...allExtensions],
  content: '', // empty initially
  immediatelyRender: true,
  shouldRerenderOnTransaction: false, // manual control for performance
});

// When note changes:
const loadNote = async (noteId: string) => {
  const note = await storageService.getNote(noteId);
  editor.commands.setContent(note.content); // swap content, don't recreate
};
```

### Pattern 2: Debounced Auto-Save via Editor onUpdate
**What:** Listen to editor `onUpdate` events, debounce by 300ms, then persist the Tiptap JSON to storage.
**When to use:** Every editor instance. The Phase 1 StorageService already has debounce built in, but the editor hook coordinates when to trigger saves.
**Example:**
```typescript
// Source: Tiptap docs + Phase 1 storage patterns
const useEditorAutosave = (editor: Editor | null, noteId: string) => {
  useEffect(() => {
    if (!editor) return;

    const handler = debounce(() => {
      const json = editor.getJSON();
      storageService.saveNoteContent(noteId, json);
    }, 300);

    editor.on('update', handler);
    return () => {
      editor.off('update', handler);
      handler.flush(); // save any pending changes on unmount
    };
  }, [editor, noteId]);
};
```

### Pattern 3: Custom Slash Command via @tiptap/suggestion
**What:** Create a custom Tiptap extension that triggers a floating React popup when the user types `/`. Uses the Suggestion utility for character detection, filtering, and keyboard navigation.
**When to use:** Required for EDIT-11 (slash command menu).
**Example:**
```typescript
// Source: Tiptap suggestion utility docs + community patterns
import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';

const SlashCommand = Extension.create({
  name: 'slashCommand',
  addOptions() {
    return { suggestion: { char: '/', command: ({ editor, range, props }) => {
      // Delete the slash character, then execute the block command
      editor.chain().focus().deleteRange(range).run();
      props.command({ editor });
    }}};
  },
  addProseMirrorPlugins() {
    return [Suggestion({ editor: this.editor, ...this.options.suggestion })];
  },
});
```

### Pattern 4: Custom NodeView for Rich Block UI
**What:** Use Tiptap's `addNodeView()` with `ReactNodeViewRenderer` to render custom React components for complex blocks (code blocks with language selector, bookmark cards, images with controls).
**When to use:** When a block needs custom interactive UI beyond what ProseMirror renders natively.
**Example:**
```typescript
// Source: Tiptap custom extensions guide
import { ReactNodeViewRenderer } from '@tiptap/react';

const CustomCodeBlock = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView);
  },
});

// CodeBlockView.tsx renders: language dropdown + copy button + highlighted code
```

### Pattern 5: Schema Versioning from Day One
**What:** Store a `schemaVersion` number with every note document. Before deserializing content, check the version and run any needed migrations.
**When to use:** Every note save/load. This prevents Pitfall 6 (silent content loss from schema mismatches).
**Example:**
```typescript
// When saving
const saveNote = (noteId: string, editor: Editor) => {
  const content = editor.getJSON();
  storageService.saveNoteContent(noteId, {
    schemaVersion: CURRENT_SCHEMA_VERSION, // e.g., 1
    doc: content,
  });
};

// When loading
const loadNote = async (noteId: string) => {
  const stored = await storageService.getNoteContent(noteId);
  const migrated = migrateIfNeeded(stored); // runs v1->v2->v3 chain if needed
  editor.commands.setContent(migrated.doc);
};
```

### Anti-Patterns to Avoid
- **Recreating editor on every note switch:** Causes flicker, loses undo history, wastes CPU. Keep one instance alive.
- **Storing HTML instead of JSON:** HTML is lossy for round-tripping through ProseMirror. Always store `editor.getJSON()`.
- **Auto-focusing the editor on new tab open:** This steals focus from Chrome's address bar. Users opening new tabs to type URLs will be frustrated. Require an explicit click to focus the editor.
- **Loading all lowlight languages eagerly:** lowlight supports 190+ languages. Import only common ones (js, ts, python, html, css, json, bash, sql, go, rust) and lazy-load the rest.
- **Putting toolbar state in Zustand:** Toolbar active states (isBold, isItalic) come from `editor.isActive()`. Do NOT duplicate this in a Zustand store -- it will be stale. Read directly from editor state.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown-to-format conversion | Custom regex parser | Tiptap input rules (built into StarterKit) | ProseMirror input rules handle cursor position, undo, and edge cases; regex fails on nested/overlapping patterns |
| Syntax highlighting | Custom tokenizer | lowlight + @tiptap/extension-code-block-lowlight | Language grammar parsing is hundreds of thousands of lines of work; lowlight uses highlight.js grammars |
| Drag-and-drop block reordering | Custom DnD implementation | @tiptap/extension-drag-handle-react | ProseMirror node manipulation during drag requires understanding the document model deeply; the official extension handles position calculations, drop targets, and transaction dispatching |
| Table cell navigation | Custom Tab key handler | @tiptap/extension-table `goToNextCell` / `goToPreviousCell` | Table cell traversal across row/column boundaries with merged cells is deceptively complex |
| Popup positioning (toolbar, slash menu) | Custom absolute positioning | tippy.js or Floating UI (used internally by Tiptap menus) | Viewport edge detection, scroll handling, flip/shift behavior are all edge cases |
| Rich text clipboard paste | Custom paste handler | ProseMirror's built-in paste handling + Tiptap's pasteRules | Clipboard HTML varies wildly across browsers and source apps |

**Key insight:** Tiptap/ProseMirror is one of the most complex editor frameworks in the web ecosystem. Its power comes from a rigorous document model and transaction system. Trying to work around it (custom DOM manipulation, manual selection handling) will always break something. Use the provided APIs.

## Common Pitfalls

### Pitfall 1: Schema Mismatch Causing Silent Content Loss
**What goes wrong:** Adding new block types (tables, task lists, bookmark cards) changes the ProseMirror schema. Content saved before the schema change gets silently dropped when loaded under the new schema.
**Why it happens:** ProseMirror explicitly discards content that does not conform to the current schema. There is no built-in migration system.
**How to avoid:** Store `schemaVersion` with every note. Write explicit migration functions. Never remove or rename node types without a migration. Test schema changes against saved documents.
**Warning signs:** Users report "my note looks different" or "content is missing" after an extension update.

### Pitfall 2: Editor Blocking First Paint on New Tab
**What goes wrong:** Initializing Tiptap with all extensions blocks the main thread for 100-300ms. On a new tab page that opens constantly, this creates a visible blank flash.
**Why it happens:** ProseMirror initialization is synchronous -- it parses the schema, creates the EditorView, registers all plugins.
**How to avoid:** Render the app shell and skeleton immediately. Initialize the editor after the shell paints. Use `immediatelyRender: true` with `shouldRerenderOnTransaction: false` for manual render control. Keep one editor instance alive across note switches.
**Warning signs:** White flash when opening new tabs. Time-to-interactive exceeding 300ms.

### Pitfall 3: Slash Command Popup Positioning Drift
**What goes wrong:** The slash command popup appears at the wrong position, drifts during scrolling, or clips off-screen.
**Why it happens:** The popup position must track the cursor position in the editor, which changes as the user scrolls or the document reflows.
**How to avoid:** Use Tiptap's Suggestion utility which provides `clientRect` for positioning. Pass this to tippy.js or Floating UI for viewport-aware placement with flip/shift middleware.
**Warning signs:** Popup appears at document top instead of cursor. Popup disappears behind viewport edges.

### Pitfall 4: Base64 Images Bloating Storage and Slowing Saves
**What goes wrong:** Large images (5MB+ photos) stored as base64 increase note size dramatically. Auto-save with 300ms debounce serializes the entire document including base64 strings on every keystroke.
**Why it happens:** base64 encoding increases size by ~33%. A 5MB image becomes 6.7MB of JSON string data.
**How to avoid:** Store images as separate blobs in IndexedDB (via Dexie), not inline in the Tiptap JSON. Store only a reference ID in the document. Compress images before storage (canvas resize to max 1920px width). Set a max image size (e.g., 10MB).
**Warning signs:** Save operations taking > 100ms. Note content exceeding 1MB.

### Pitfall 5: Floating Toolbar Flickering on Selection Change
**What goes wrong:** The BubbleMenu appears/disappears rapidly as the user adjusts their text selection, creating a distracting flicker.
**Why it happens:** Every selection change triggers a `shouldShow` evaluation. Without debouncing, the menu toggles on every mouse move during selection.
**How to avoid:** Use BubbleMenu's `shouldShow` callback to only show when selection is non-empty and not in a code block or image. Add a small delay before hiding (100ms) to avoid flicker during selection adjustment.
**Warning signs:** Toolbar flashes on/off during text selection. Toolbar appears inside code blocks or tables.

### Pitfall 6: Link Bookmark Card Metadata Fetch Failures
**What goes wrong:** Fetching OG metadata for link preview cards fails silently because the target site blocks CORS, returns no OG tags, or times out.
**Why it happens:** Most websites do not set CORS headers for their HTML pages. However, in a Chrome extension context, the background service worker CAN make cross-origin requests if the extension has appropriate host permissions or uses the `fetch` API from the service worker.
**How to avoid:** Fetch metadata from the background service worker (not the content script or new tab page). Use a timeout (5 seconds). Parse `<title>`, `og:title`, `og:description`, `og:image`, and favicon. Fall back gracefully: if metadata unavailable, render as a plain clickable URL.
**Warning signs:** All bookmark cards showing only the URL. Console errors about CORS.

## Code Examples

### Full Editor Setup with Extensions
```typescript
// Source: Tiptap v3 docs + verified extension APIs
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { common, createLowlight } from 'lowlight';

const lowlight = createLowlight(common); // ~30 common languages

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      codeBlock: false, // replaced by CodeBlockLowlight
    }),
    CodeBlockLowlight.configure({ lowlight }),
    Table.configure({ resizable: true }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Image.configure({ allowBase64: true, inline: false }),
    Placeholder.configure({
      placeholder: 'Type / for commands...',
    }),
    // + SlashCommand (custom), DragHandleReact, FileHandler, BookmarkCard (custom)
  ],
  content: '',
  immediatelyRender: true,
  shouldRerenderOnTransaction: false,
});
```

### BubbleMenu Toolbar
```typescript
// Source: Tiptap BubbleMenu React docs
import { BubbleMenu } from '@tiptap/react/menus';

<BubbleMenu
  editor={editor}
  shouldShow={({ editor, state }) => {
    // Only show for text selection, not in code blocks or images
    const { from, to } = state.selection;
    if (from === to) return false;
    if (editor.isActive('codeBlock')) return false;
    if (editor.isActive('image')) return false;
    return true;
  }}
>
  <button onClick={() => editor.chain().focus().toggleBold().run()}
    className={editor.isActive('bold') ? 'is-active' : ''}>
    B
  </button>
  {/* ...italic, underline, strikethrough, code, link, heading dropdown */}
</BubbleMenu>
```

### DragHandle React Integration
```typescript
// Source: Tiptap DragHandle React docs
import { DragHandleReact } from '@tiptap/extension-drag-handle-react';

<DragHandleReact editor={editor}>
  <div className="drag-handle">
    <GripVertical size={16} /> {/* lucide-react icon */}
  </div>
</DragHandleReact>
```

### FileHandler for Image Paste/Drop
```typescript
// Source: Tiptap FileHandler extension docs
import FileHandler from '@tiptap/extension-file-handler';

FileHandler.configure({
  allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
  onPaste: (editor, files) => {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        editor.chain().focus().setImage({ src: reader.result as string }).run();
      };
      reader.readAsDataURL(file); // converts to base64
    });
  },
  onDrop: (editor, files, pos) => {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        editor.chain().focus().setImage({ src: reader.result as string }).run();
      };
      reader.readAsDataURL(file);
    });
  },
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tiptap v2 (separate packages) | Tiptap v3 (unified @tiptap/* namespace) | 2025 | StarterKit includes Underline and Link by default; DragHandle and FileHandler now free/MIT |
| DragHandle as paid Pro extension | DragHandle open-sourced MIT | Mid-2025 | Free to use; no Tiptap subscription needed |
| FileHandler as paid Pro extension | FileHandler open-sourced MIT | Mid-2025 | Free to use; enables paste/drop file handling |
| highlight.js for code blocks | lowlight (highlight.js tree) | Ongoing | lowlight is the recommended integration for Tiptap's CodeBlockLowlight extension |
| BubbleMenu from @tiptap/extension-bubble-menu | BubbleMenu from @tiptap/react/menus | Tiptap v3 | React component import path changed; no separate extension install needed |

**Deprecated/outdated:**
- `@tiptap-pro/*` package namespace: These packages are now under `@tiptap/*` (MIT). Do not install from the pro registry.
- `@tiptap/extension-bubble-menu` as separate package: In v3, import `BubbleMenu` from `@tiptap/react/menus` instead.

## Open Questions

1. **Image storage strategy: inline base64 vs separate blobs**
   - What we know: User decision says "stored as base64 in IndexedDB." base64 inline in Tiptap JSON works but bloats document size.
   - What's unclear: Whether to store base64 directly in the Tiptap JSON (simpler but slower saves) or store images as separate Dexie records with references (more complex but better performance).
   - Recommendation: Start with base64 inline for simplicity (user's stated preference). If save performance degrades, refactor to separate blob storage. Add image compression (max 1920px width) to limit size.

2. **Bookmark card metadata fetching in Chrome extension context**
   - What we know: Chrome extension service workers can make cross-origin fetch requests. OG metadata requires parsing remote HTML.
   - What's unclear: Whether to use the service worker's `fetch()` directly or use `chrome.runtime.sendMessage` to delegate fetching from the new tab page to the service worker.
   - Recommendation: Use `chrome.runtime.sendMessage` to request metadata from the service worker, which performs the cross-origin fetch and HTML parsing. Return structured metadata (title, description, image, favicon) to the new tab page for rendering.

3. **Table + buttons on edges**
   - What we know: Tiptap Table extension provides programmatic `addRowAfter()`, `addColumnAfter()`, etc. commands.
   - What's unclear: How to position + buttons on table edges reliably (custom NodeView vs CSS overlay).
   - Recommendation: Use a custom Table NodeView wrapper that renders + button overlays positioned with CSS relative to the table DOM element. Clicking them calls the appropriate editor command.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (from Phase 1 infrastructure) |
| Config file | vitest.config.ts (created in Phase 1, Plan 3) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EDIT-01 | Bold/italic/underline/strikethrough toggle | unit | `npx vitest run tests/editor/formatting.test.ts -t "rich text"` | Wave 0 |
| EDIT-02 | Markdown shortcuts auto-convert | unit | `npx vitest run tests/editor/input-rules.test.ts -t "markdown"` | Wave 0 |
| EDIT-03 | H1/H2/H3 via toolbar and shortcuts | unit | `npx vitest run tests/editor/headings.test.ts` | Wave 0 |
| EDIT-04 | Ordered/unordered lists | unit | `npx vitest run tests/editor/lists.test.ts` | Wave 0 |
| EDIT-05 | Checkbox/task items | unit | `npx vitest run tests/editor/task-list.test.ts` | Wave 0 |
| EDIT-06 | Code blocks with syntax highlighting | unit | `npx vitest run tests/editor/code-block.test.ts` | Wave 0 |
| EDIT-07 | Table create/edit/add-remove rows+cols | unit | `npx vitest run tests/editor/table.test.ts` | Wave 0 |
| EDIT-08 | Image embed (paste, drop, URL) | unit | `npx vitest run tests/editor/image.test.ts` | Wave 0 |
| EDIT-09 | Link bookmark cards | unit | `npx vitest run tests/editor/bookmark-card.test.ts` | Wave 0 |
| EDIT-10 | Block drag-and-drop reorder | manual-only | Manual: hover block, drag handle appears, drag to reorder | N/A (DnD requires real browser) |
| EDIT-11 | Slash command menu | unit | `npx vitest run tests/editor/slash-command.test.ts` | Wave 0 |
| EDIT-12 | Keyboard shortcuts | unit | `npx vitest run tests/editor/keyboard-shortcuts.test.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run tests/editor/ --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/editor/formatting.test.ts` -- covers EDIT-01
- [ ] `tests/editor/input-rules.test.ts` -- covers EDIT-02
- [ ] `tests/editor/headings.test.ts` -- covers EDIT-03
- [ ] `tests/editor/lists.test.ts` -- covers EDIT-04
- [ ] `tests/editor/task-list.test.ts` -- covers EDIT-05
- [ ] `tests/editor/code-block.test.ts` -- covers EDIT-06
- [ ] `tests/editor/table.test.ts` -- covers EDIT-07
- [ ] `tests/editor/image.test.ts` -- covers EDIT-08
- [ ] `tests/editor/bookmark-card.test.ts` -- covers EDIT-09
- [ ] `tests/editor/slash-command.test.ts` -- covers EDIT-11
- [ ] `tests/editor/keyboard-shortcuts.test.ts` -- covers EDIT-12
- [ ] `tests/editor/autosave.test.ts` -- covers persistence behavior
- [ ] `tests/editor/helpers.ts` -- shared editor test helpers (create editor instance with extensions, simulate typing)
- [ ] Note: Tiptap editor tests require `jsdom` environment and mocking ProseMirror view. Set `environment: 'jsdom'` in vitest config for editor tests.

## Sources

### Primary (HIGH confidence)
- [Tiptap v3 Official Docs](https://tiptap.dev/docs/editor/getting-started/overview) -- editor setup, extension API, React integration
- [Tiptap Extensions Overview](https://tiptap.dev/docs/editor/extensions/overview) -- 27 node extensions, 9 marks, 40+ functionality extensions
- [Tiptap Performance Guide](https://tiptap.dev/docs/guides/performance) -- shouldRerenderOnTransaction, component isolation, useEditorState
- [Tiptap Suggestion Utility](https://tiptap.dev/docs/editor/api/utilities/suggestion) -- API for building slash command menus
- [Tiptap BubbleMenu React](https://tiptap.dev/docs/editor/extensions/functionality/bubble-menu) -- floating toolbar with shouldShow control
- [Tiptap Table Extension](https://tiptap.dev/docs/editor/extensions/nodes/table) -- TableKit, row/column commands, resize
- [Tiptap CodeBlockLowlight](https://tiptap.dev/docs/editor/extensions/nodes/code-block-lowlight) -- syntax highlighting with lowlight
- [Tiptap Image Extension](https://tiptap.dev/docs/editor/extensions/nodes/image) -- base64 support, resize config
- [Tiptap DragHandle React](https://tiptap.dev/docs/editor/extensions/functionality/drag-handle-react) -- hover grip, positioning config
- npm registry -- all package versions verified 2026-03-18 at 3.20.4

### Secondary (MEDIUM confidence)
- [Tiptap open-sources 10 Pro extensions (HN)](https://news.ycombinator.com/item?id=44202103) -- DragHandle, FileHandler now MIT
- [Tiptap Slash Commands Example](https://tiptap.dev/docs/examples/experiments/slash-commands) -- experimental, not published, but documents the pattern
- [Tiptap FAQ](https://tiptap.dev/docs/guides/faq) -- schema validation, content loss gotchas

### Tertiary (LOW confidence)
- [@harshtalks/slash-tiptap](https://www.npmjs.com/package/@harshtalks/slash-tiptap) -- community slash command wrapper (reference only, not using)
- [GitHub Discussion: Link preview in Tiptap](https://github.com/ueberdosis/tiptap/discussions/3552) -- community patterns for bookmark cards

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages verified on npm at current versions; Tiptap v3 is stable and well-documented
- Architecture: HIGH -- patterns sourced from official Tiptap docs, performance guide, and extension APIs
- Pitfalls: HIGH -- schema migration pitfall verified from Tiptap FAQ; performance pitfalls from official performance guide; storage pitfalls from Phase 1 research

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (Tiptap v3 is stable; minor version bumps expected but no breaking changes)
