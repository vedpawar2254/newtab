# Phase 3: Pages + Navigation - Research

**Researched:** 2026-03-18
**Domain:** React tree navigation, drag-and-drop reordering, page CRUD with Zustand + Dexie.js
**Confidence:** HIGH

## Summary

Phase 3 builds a nested page hierarchy with sidebar tree navigation, drag-and-drop reordering, and page lifecycle operations (create, rename, delete) on top of the existing Phase 1 storage layer and Phase 2 editor. The existing codebase already provides the core data model (`TreeIndex`, `TreeIndexEntry`, `NoteRecord`), a Zustand store (`useNotesStore`) with `createNote`, `deleteNote`, and `updateNote`, and a Dexie.js-backed `StorageService` with `loadTreeIndex`/`saveTreeIndex`. Phase 3's job is to build the UI layer: a collapsible tree component in the sidebar, drag-and-drop via dnd-kit, inline rename, and cascade delete.

The primary technical challenge is the drag-and-drop tree. The proven pattern from dnd-kit's official tree example (and the community `dnd-kit-sortable-tree` package) flattens the nested tree into a single-level sortable list while preserving depth metadata, then rebuilds the tree on drop. This approach works cleanly with React 19 and the existing Zustand store. The tree index architecture already stores `parentId`, `childIds`, `order`, and `path` -- all needed for the flatten/rebuild pattern.

**Primary recommendation:** Use `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` (classic packages, v6.3.1/v10.0.0/v3.2.2) for drag-and-drop, adapting the official tree example's flatten pattern. Build the tree component from scratch using the existing data model rather than adding a third-party tree component.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Indentation + chevrons: each nesting level indents ~16px with a rotate-on-expand chevron arrow (Notion-style)
- Infinite nesting depth -- no artificial limit (matches PAGE-02 requirement)
- Active page highlighted with subtle lighter background (#2f2f2f range) and blue accent left border
- Text-only tree -- no icons or emoji on pages. Clean and minimal.
- Chevrons rotate smoothly on expand/collapse
- Persistent '+ New Page' button at the top of the sidebar, always visible
- Hover '+' icon appears on each page row to create a child page nested under that parent
- New pages named "Untitled" with title field immediately auto-focused for typing
- Creating a page navigates to it in the editor immediately
- Drop indicators: blue horizontal line shows target position, dragging over a page's right half activates indent zone to nest as child
- Children move with parent -- entire subtree relocates together
- Collapsed parents auto-expand after ~500ms hover during drag
- Drag handle (grip icon) appears on hover to the left of the page name -- prevents accidental drags when clicking to navigate
- Double-click page name in sidebar to rename inline (Enter to confirm, Escape to cancel)
- '...' (more) button appears on hover next to each page -- menu includes Delete (room for future actions)
- Cascade delete: deleting a parent removes the entire subtree
- Confirmation dialog only when deleting a page with children ("Delete X and N child pages?")
- Deleting a leaf page happens instantly with no confirmation

### Claude's Discretion
- Drag-and-drop animation easing and timing details
- Exact hover delay before '+' and '...' buttons appear
- What page to navigate to after deleting the currently active page
- Tree expand/collapse animation duration
- Empty sidebar state (before any pages exist)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PAGE-01 | User can create new pages/notes from sidebar | Existing `useNotesStore.createNote()` handles data layer; need UI: "+" button at sidebar top and hover "+" per row |
| PAGE-02 | User can nest any page inside another page (infinite depth) | `TreeIndexEntry` already has `parentId`, `childIds`, `path[]`; dnd-kit flatten pattern handles infinite depth natively |
| PAGE-03 | User can see page hierarchy in collapsible sidebar tree | Build recursive tree component using flattened `TreeIndex.entries`; track `collapsedIds` in Zustand UI store |
| PAGE-04 | User can rename pages inline | Double-click handler on tree item switches to `<input>`, Enter confirms, Escape cancels; updates `NoteRecord.title` + `TreeIndexEntry.title` |
| PAGE-05 | User can delete pages | Extend `useNotesStore.deleteNote()` to cascade (delete subtree); confirmation dialog via Radix Dialog for parent pages |
| PAGE-06 | User can reorder pages via drag-and-drop in sidebar | dnd-kit classic packages with flatten/rebuild tree pattern; `getProjection()` calculates target depth from drag offset |

</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | ^19.2.4 | UI framework | Already installed |
| Zustand | ^5.0.12 | State management | Already installed, stores exist |
| Dexie.js | ^4.3.0 | IndexedDB wrapper | Already installed, db schema exists |
| Tailwind CSS | ^4.2.2 | Styling | Already installed, dark theme tokens defined |
| lucide-react | ^0.577.0 | Icons | Already installed -- provides ChevronRight, GripVertical, Plus, MoreHorizontal, Trash2 |
| @radix-ui/react-tooltip | ^1.2.8 | Tooltips | Already installed |

### New Dependencies for Phase 3
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @dnd-kit/core | ^6.3.1 | Drag-and-drop engine | Zero-dependency DnD engine. Industry standard for React DnD. Supports React 18+19. |
| @dnd-kit/sortable | ^10.0.0 | Sortable preset | Reorderable list primitives. Official preset for sortable interactions. |
| @dnd-kit/utilities | ^3.2.2 | CSS transform utilities | Provides `CSS.Transform.toString()` for smooth drag transforms. |
| @radix-ui/react-dialog | latest | Confirmation dialogs | Accessible, unstyled dialog for cascade delete confirmation. Already in stack research. |
| @radix-ui/react-dropdown-menu | latest | Context menus | Accessible dropdown for the "..." more menu on each tree item. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @dnd-kit/core + @dnd-kit/sortable | @hello-pangea/dnd | hello-pangea is simpler for flat lists but has a documented limitation with nested drag between levels -- not suitable for tree reordering |
| @dnd-kit/core + @dnd-kit/sortable | @atlaskit/pragmatic-drag-and-drop | Good tree support (Atlassian uses it for Jira), but brings Atlaskit ecosystem dependency. dnd-kit is lighter and has a proven tree example. |
| @dnd-kit/core + @dnd-kit/sortable | @dnd-kit/react (v0.3.2) | New React-specific package, but v0.3 is pre-1.0 and the tree example only exists for classic packages. Too risky for production. |
| Custom tree component | dnd-kit-sortable-tree (v0.1.73) | Pre-built tree component but low version, limited customization for Notion-style UX. Better to adapt the official example pattern. |

**Installation:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @radix-ui/react-dialog @radix-ui/react-dropdown-menu
```

## Architecture Patterns

### Project Structure (additions for Phase 3)
```
lib/
  stores/
    ui-store.ts          # EXTEND: add collapsedIds, renamingId
    notes-store.ts       # EXTEND: add moveNote, renameNote, cascadeDelete
  utils/
    tree-utils.ts        # NEW: flattenTree, buildTree, getProjection, getChildCount
entrypoints/newtab/
  components/
    sidebar/
      PageTree.tsx        # NEW: main tree container with DndContext
      PageTreeItem.tsx    # NEW: single tree row (SortableItem)
      NewPageButton.tsx   # NEW: persistent "+" button
      DeleteConfirmDialog.tsx  # NEW: cascade delete confirmation
```

### Pattern 1: Flatten/Rebuild Tree for DnD
**What:** The tree hierarchy is stored as nested data (`TreeIndex.entries` with `parentId`/`childIds`), but rendered as a flat list for dnd-kit's `SortableContext`. Each item carries its `depth` for visual indentation. On drag end, the flat order + projected depth is used to rebuild the tree.
**When to use:** Always -- this is the only proven pattern for dnd-kit tree sorting.
**Example:**
```typescript
// Source: dnd-kit official tree example
// https://github.com/clauderic/dnd-kit/blob/master/stories/3%20-%20Examples/Tree/SortableTree.tsx

interface FlattenedItem {
  id: string;
  parentId: string | null;
  depth: number;
  index: number;  // position in flattened array
  title: string;
  childCount: number;
}

function flattenTree(
  entries: TreeIndexEntry[],
  parentId: string | null = null,
  depth: number = 0
): FlattenedItem[] {
  const children = entries
    .filter(e => e.parentId === parentId)
    .sort((a, b) => a.order - b.order);

  return children.flatMap((entry, index) => {
    const childCount = getDescendantCount(entries, entry.id);
    return [
      { id: entry.id, parentId, depth, index, title: entry.title, childCount },
      ...flattenTree(entries, entry.id, depth + 1),
    ];
  });
}

function getDescendantCount(entries: TreeIndexEntry[], parentId: string): number {
  const children = entries.filter(e => e.parentId === parentId);
  return children.reduce((acc, child) => acc + 1 + getDescendantCount(entries, child.id), 0);
}
```

### Pattern 2: getProjection for Indent/Outdent During Drag
**What:** As the user drags horizontally, `getProjection()` calculates the target depth based on the drag offset. This determines whether a drop will nest (indent) or un-nest (outdent) the item.
**When to use:** During `onDragMove` events to show the drop indicator at the correct depth.
**Example:**
```typescript
// Source: dnd-kit official tree example
const INDENTATION_WIDTH = 16; // matches CONTEXT.md: ~16px per level

function getProjection(
  items: FlattenedItem[],
  activeId: string,
  overId: string,
  dragOffset: number
): { depth: number; parentId: string | null } {
  const overIndex = items.findIndex(i => i.id === overId);
  const activeIndex = items.findIndex(i => i.id === activeId);
  const activeItem = items[activeIndex];

  const projectedDepth = activeItem.depth + Math.round(dragOffset / INDENTATION_WIDTH);

  // Clamp depth: max is overItem.depth + 1 (nest as child), min is 0 (root)
  const maxDepth = getMaxDepth(items, overIndex);
  const minDepth = getMinDepth(items, overIndex);
  const depth = Math.min(Math.max(projectedDepth, minDepth), maxDepth);

  // Find parent at this depth
  const parentId = getParentId(items, overIndex, depth);
  return { depth, parentId };
}
```

### Pattern 3: Expand Collapsed Parent on Hover During Drag
**What:** When dragging over a collapsed parent for ~500ms, auto-expand it so user can drop into its children.
**When to use:** During active drag, via a timer set in `onDragOver`.
**Example:**
```typescript
// Timer ref for auto-expand
const expandTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

function handleDragOver(event: DragOverEvent) {
  const { over } = event;
  if (!over) return;

  // Clear previous timer
  if (expandTimeoutRef.current) clearTimeout(expandTimeoutRef.current);

  // If hovering over a collapsed item with children, auto-expand after 500ms
  if (collapsedIds.has(over.id as string)) {
    expandTimeoutRef.current = setTimeout(() => {
      toggleCollapsed(over.id as string);
    }, 500);
  }
}
```

### Pattern 4: Cascade Delete with Subtree Collection
**What:** Deleting a parent deletes all descendants. Collect the full subtree first, then batch-delete from storage.
**When to use:** For `deleteNote` when the note has children.
**Example:**
```typescript
function collectSubtreeIds(entries: TreeIndexEntry[], rootId: string): string[] {
  const children = entries.filter(e => e.parentId === rootId);
  return children.flatMap(child => [child.id, ...collectSubtreeIds(entries, child.id)]);
}

// In notes-store.ts:
cascadeDelete: async (id: string) => {
  const { treeIndex } = get();
  if (!treeIndex) return;

  const descendantIds = collectSubtreeIds(treeIndex.entries, id);
  const allIds = [id, ...descendantIds];

  // Batch delete from Dexie
  await db.notes.bulkDelete(allIds);

  // Update tree index
  const updatedEntries = treeIndex.entries
    .filter(e => !allIds.includes(e.id))
    .map(e => ({
      ...e,
      childIds: e.childIds.filter(cid => !allIds.includes(cid)),
    }));

  const updatedIndex = { entries: updatedEntries, updatedAt: Date.now() };
  await storageService.saveTreeIndex(updatedIndex);

  set(s => {
    const newCache = new Map(s.noteCache);
    allIds.forEach(aid => newCache.delete(aid));
    return { noteCache: newCache, treeIndex: updatedIndex };
  });
}
```

### Pattern 5: Inline Rename with Controlled Input
**What:** Double-click a page name switches from text to `<input>`. Enter confirms, Escape cancels.
**When to use:** For PAGE-04 inline rename.
**Example:**
```typescript
// In PageTreeItem.tsx
const [isRenaming, setIsRenaming] = useState(false);
const [renameValue, setRenameValue] = useState(title);
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  if (isRenaming) inputRef.current?.select();
}, [isRenaming]);

function handleKeyDown(e: React.KeyboardEvent) {
  if (e.key === 'Enter') {
    onRename(id, renameValue.trim() || 'Untitled');
    setIsRenaming(false);
  } else if (e.key === 'Escape') {
    setRenameValue(title);
    setIsRenaming(false);
  }
}
```

### Anti-Patterns to Avoid
- **Storing expanded/collapsed state in the tree index (Dexie):** UI-only state. Keep `collapsedIds` in the Zustand UI store only. Persisting it to IndexedDB would cause unnecessary writes.
- **Re-rendering entire tree on any change:** Use `React.memo` on `PageTreeItem` and only pass primitive props. The flattened items array reference should only change when the tree structure changes.
- **Using nested `SortableContext` for nested levels:** This prevents cross-level dragging. The flatten pattern uses a single `SortableContext` with all visible items.
- **Direct Dexie calls from components:** All storage access goes through `storageService` and `useNotesStore`. Components never import `db` directly.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop | Custom mousedown/mousemove/mouseup DnD | @dnd-kit/core + @dnd-kit/sortable | Touch support, keyboard accessibility, collision detection, overlay rendering -- all handled |
| Drop indicators | Custom position calculation | dnd-kit's `getProjection` pattern | Edge cases with scroll position, nested depth clamping, boundary detection |
| Confirmation dialog | Custom modal with focus trap | @radix-ui/react-dialog | Focus trapping, escape handling, scroll lock, aria attributes |
| Context menu ("...") | Custom dropdown | @radix-ui/react-dropdown-menu | Keyboard navigation, focus management, portal rendering, outside-click dismiss |
| UUID generation | Custom ID function | `crypto.randomUUID()` | Already used in `createNote`. Browser-native, cryptographically random. |

**Key insight:** The dnd-kit tree pattern is genuinely complex (flatten/rebuild, projection calculation, overlay rendering, auto-expand timers). The official example is ~400 lines. Do not attempt to build tree DnD from scratch -- adapt the proven pattern.

## Common Pitfalls

### Pitfall 1: Tree Index Desync After Failed Write
**What goes wrong:** Zustand state updates optimistically but the Dexie `saveTreeIndex` call fails. Tree in memory differs from tree on disk.
**Why it happens:** IndexedDB writes are async and can fail (quota, transaction error).
**How to avoid:** After a failed `saveTreeIndex`, revert the Zustand state by re-loading from Dexie. Alternatively, only update Zustand state after the Dexie write succeeds for destructive operations (delete, move).
**Warning signs:** Tree looks wrong after reopening a new tab. Notes appear/disappear inconsistently.

### Pitfall 2: Drag Overlay Flicker
**What goes wrong:** The dragged item disappears from its original position before the overlay appears, causing a visual flash.
**Why it happens:** Default dnd-kit behavior removes the item from the DOM. Need to use `DragOverlay` component to render a clone during drag.
**How to avoid:** Always render a `<DragOverlay>` inside `<DndContext>`. When `activeId` is set, render a preview of the dragged item (and its child count) in the overlay.
**Warning signs:** Items visually jump or flash when drag starts.

### Pitfall 3: Order Gaps After Delete
**What goes wrong:** After deleting a middle item, siblings have order values like [0, 2, 3] instead of [0, 1, 2]. Over time, order values drift.
**Why it happens:** Deleting doesn't re-index sibling orders.
**How to avoid:** After any delete, re-index the `order` field of remaining siblings. A `reindexSiblings(parentId)` utility handles this.
**Warning signs:** New items appear in unexpected positions.

### Pitfall 4: Infinite Re-renders from Tree Flattening
**What goes wrong:** `flattenTree` runs on every render because the input array is a new reference.
**Why it happens:** Zustand returns a new `treeIndex` object reference on every state change.
**How to avoid:** Memoize with `useMemo` keyed on `treeIndex.updatedAt` (a stable primitive). Or use Zustand's `useShallow` selector to only subscribe to `treeIndex`.
**Warning signs:** Sidebar feels sluggish, React DevTools shows excessive re-renders.

### Pitfall 5: Lost Focus After Inline Rename Confirm
**What goes wrong:** After pressing Enter to confirm rename, keyboard focus is lost (goes to `<body>`).
**Why it happens:** The input element is removed from DOM, and nothing receives focus.
**How to avoid:** After rename completes, focus the tree item button/row that was just renamed.
**Warning signs:** User presses Enter, then has to click again to continue navigating.

### Pitfall 6: Cascade Delete Doesn't Clean Up Note Records
**What goes wrong:** Tree index is updated but note records remain orphaned in Dexie's `notes` table.
**Why it happens:** The existing `deleteNote` only deletes one record. Cascade requires `db.notes.bulkDelete(allIds)`.
**How to avoid:** Always collect full subtree IDs before deleting. Use `bulkDelete` for efficiency.
**Warning signs:** Storage usage grows over time despite deleting pages. Orphaned notes with no tree entry.

## Code Examples

### DndContext Setup for Tree
```typescript
// Source: adapted from dnd-kit official tree example
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragMoveEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

function PageTree() {
  const treeIndex = useNotesStore(s => s.treeIndex);
  const collapsedIds = useUIStore(s => s.collapsedIds);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);

  const flattenedItems = useMemo(() => {
    if (!treeIndex) return [];
    const flat = flattenTree(treeIndex.entries);
    // Remove children of collapsed or dragged items
    const hiddenIds = [...collapsedIds, ...(activeId ? [activeId] : [])];
    return removeChildrenOf(flat, hiddenIds);
  }, [treeIndex, collapsedIds, activeId]);

  const sortedIds = useMemo(() => flattenedItems.map(i => i.id), [flattenedItems]);

  const projected = activeId && overId
    ? getProjection(flattenedItems, activeId, overId, offsetLeft)
    : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
        {flattenedItems.map(item => (
          <PageTreeItem
            key={item.id}
            {...item}
            depth={item.id === activeId && projected ? projected.depth : item.depth}
          />
        ))}
      </SortableContext>
      <DragOverlay dropAnimation={null}>
        {activeId ? <PageTreeItemOverlay id={activeId} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
```

### SortableTreeItem with Drag Handle
```typescript
// Source: adapted from dnd-kit sortable docs
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronRight, Plus, MoreHorizontal } from 'lucide-react';

interface PageTreeItemProps {
  id: string;
  title: string;
  depth: number;
  childCount: number;
  isActive: boolean;
  isCollapsed: boolean;
}

function PageTreeItem({ id, title, depth, childCount, isActive, isCollapsed }: PageTreeItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    paddingLeft: `${depth * 16}px`,  // 16px per indent level per CONTEXT.md
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center h-8 px-2 text-sm cursor-pointer
        ${isActive ? 'bg-surface-elevated border-l-2 border-accent' : 'hover:bg-surface'}`}
    >
      {/* Drag handle -- visible on hover */}
      <button
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover:opacity-100 cursor-grab p-0.5"
      >
        <GripVertical size={14} className="text-text-secondary" />
      </button>

      {/* Expand/collapse chevron */}
      {childCount > 0 && (
        <button
          onClick={() => toggleCollapsed(id)}
          className="p-0.5"
        >
          <ChevronRight
            size={14}
            className={`text-text-secondary transition-transform duration-200
              ${isCollapsed ? '' : 'rotate-90'}`}
          />
        </button>
      )}

      {/* Page title */}
      <span className="flex-1 truncate ml-1">{title || 'Untitled'}</span>

      {/* Hover actions */}
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
        <button onClick={() => createChildPage(id)} className="p-0.5">
          <Plus size={14} className="text-text-secondary" />
        </button>
        <MoreMenu pageId={id} childCount={childCount} />
      </div>
    </div>
  );
}
```

### Zustand UI Store Extension (collapsedIds)
```typescript
// Extend existing ui-store.ts
interface UIState {
  // ... existing fields
  collapsedIds: Set<string>;
  renamingId: string | null;
  toggleCollapsed: (id: string) => void;
  setRenamingId: (id: string | null) => void;
}

// In the store:
collapsedIds: new Set<string>(),
renamingId: null,
toggleCollapsed: (id) => set(s => {
  const next = new Set(s.collapsedIds);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return { collapsedIds: next };
}),
setRenamingId: (id) => set({ renamingId: id }),
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-beautiful-dnd | @dnd-kit or @hello-pangea/dnd | 2024 (Atlassian deprecated rbd) | rbd is unmaintained; dnd-kit is the ecosystem standard |
| react-sortable-tree | Custom dnd-kit tree or dnd-kit-sortable-tree | 2023 (react-sortable-tree unmaintained) | Old library depends on react-dnd and legacy React APIs |
| @dnd-kit/react (new) | @dnd-kit/core + @dnd-kit/sortable (classic) | Ongoing (v0.3.2 is pre-1.0) | New package exists but tree example only works with classic packages |
| Nested SortableContexts | Single flat SortableContext | 2023+ | Nested contexts prevent cross-level dragging; flatten pattern is standard |

**Deprecated/outdated:**
- `react-sortable-tree`: Unmaintained, depends on legacy react-dnd. Do not use.
- `react-beautiful-dnd`: Deprecated by Atlassian in 2024. Use `@hello-pangea/dnd` (fork) for flat lists, or `@dnd-kit` for trees.

## Open Questions

1. **Performance with 500+ pages in the tree**
   - What we know: Flattening is O(n) and runs on every tree change. For typical usage (< 100 pages), this is instant.
   - What's unclear: At what page count does the flatten + render cycle become perceptible?
   - Recommendation: Build without virtualization first. If performance becomes an issue, add `react-window` to virtualize the flat list. The flat list pattern makes virtualization straightforward.

2. **What page to navigate to after deleting the active page**
   - What we know: This is Claude's discretion per CONTEXT.md
   - Recommendation: Navigate to the previous sibling. If no previous sibling, navigate to the parent. If deleting the last root page, show empty state.

3. **Empty sidebar state**
   - What we know: This is Claude's discretion per CONTEXT.md
   - Recommendation: Show a centered message like "No pages yet" with the "+" button prominent. Keep it minimal and non-distracting.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.0 |
| Config file | none -- see Wave 0 |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PAGE-01 | Create new page from sidebar | unit | `npx vitest run tests/stores/notes-store.test.ts -t "createNote"` | No -- Wave 0 |
| PAGE-02 | Nest page inside another (infinite depth) | unit | `npx vitest run tests/utils/tree-utils.test.ts -t "flattenTree"` | No -- Wave 0 |
| PAGE-03 | Collapsible sidebar tree display | unit | `npx vitest run tests/utils/tree-utils.test.ts -t "removeChildrenOf"` | No -- Wave 0 |
| PAGE-04 | Rename pages inline | unit | `npx vitest run tests/stores/notes-store.test.ts -t "renameNote"` | No -- Wave 0 |
| PAGE-05 | Delete pages (cascade) | unit | `npx vitest run tests/stores/notes-store.test.ts -t "cascadeDelete"` | No -- Wave 0 |
| PAGE-06 | Reorder via drag-and-drop | unit | `npx vitest run tests/utils/tree-utils.test.ts -t "getProjection"` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` -- Vitest config with jsdom environment
- [ ] `tests/utils/tree-utils.test.ts` -- covers PAGE-02, PAGE-03, PAGE-06 (flattenTree, buildTree, getProjection, removeChildrenOf, collectSubtreeIds)
- [ ] `tests/stores/notes-store.test.ts` -- covers PAGE-01, PAGE-04, PAGE-05 (createNote, renameNote, cascadeDelete). Needs Dexie mock (fake-indexeddb).
- [ ] `npm install -D fake-indexeddb` -- required to mock IndexedDB in Vitest/jsdom

## Sources

### Primary (HIGH confidence)
- [dnd-kit official tree example](https://github.com/clauderic/dnd-kit/blob/master/stories/3%20-%20Examples/Tree/SortableTree.tsx) - flatten/rebuild pattern, getProjection, DragOverlay usage
- [dnd-kit sortable docs](https://docs.dndkit.com/presets/sortable) - SortableContext, useSortable, verticalListSortingStrategy
- [@dnd-kit/core npm](https://www.npmjs.com/package/@dnd-kit/core) - v6.3.1, verified
- [@dnd-kit/sortable npm](https://www.npmjs.com/package/@dnd-kit/sortable) - v10.0.0, verified
- [@dnd-kit/react npm](https://www.npmjs.com/package/@dnd-kit/react) - v0.3.2, React 18/19 peer deps confirmed
- Existing codebase: `lib/storage/types.ts`, `lib/stores/notes-store.ts`, `lib/stores/ui-store.ts` - data model already supports tree hierarchy

### Secondary (MEDIUM confidence)
- [dnd-kit-sortable-tree package](https://github.com/Shaddix/dnd-kit-sortable-tree) - community tree component based on official example
- [React + dnd-kit tree implementation article](https://dev.to/fupeng_wang/react-dnd-kit-implement-tree-list-drag-and-drop-sortable-225l) - flatten pattern walkthrough
- [react-notion-sortable-tree](https://github.com/suimenkathemove/react-notion-sortable-tree) - Notion-specific tree implementation reference
- [Top 5 DnD Libraries for React 2026](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react) - library comparison and tree support assessment

### Tertiary (LOW confidence)
- [Pragmatic drag and drop - Atlassian Design](https://atlassian.design/components/pragmatic-drag-and-drop/) - alternative DnD approach, not recommended for this project

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - dnd-kit versions verified via npm, existing codebase inspected, React 19 compatibility confirmed
- Architecture: HIGH - dnd-kit's official tree example provides the exact pattern needed; existing data model (`TreeIndexEntry`) maps directly to the flatten/rebuild approach
- Pitfalls: HIGH - well-documented in dnd-kit issues and tree DnD community; existing store patterns reveal desync risks

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (stable libraries, low change velocity)
