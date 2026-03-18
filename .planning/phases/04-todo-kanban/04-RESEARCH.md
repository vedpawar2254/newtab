# Phase 4: Todo + Kanban - Research

**Researched:** 2026-03-19
**Domain:** Drag-and-drop task management (todo panel + kanban board) with unified data model
**Confidence:** HIGH

## Summary

Phase 4 adds a right-sidebar todo panel and a full-content-area kanban board view, both backed by a single task data model stored in Dexie.js. The project already has `@dnd-kit/core` 6.3.1 and `@dnd-kit/sortable` 10.0.0 installed, so no new drag-and-drop library is needed. The primary architectural challenge is the unified data model: tasks appear as a flat list in the todo panel and as column-grouped cards in the kanban board, with changes in either view reflected immediately in the other.

The existing codebase provides clear patterns to follow: Zustand store with cache + Dexie persistence (see `notes-store.ts`), sidebar toggle with margin transition (see `AppShell.tsx` and `useSidebarToggle.ts`), and storage service abstraction (see `storage-service.ts`). The right panel mirrors the left sidebar pattern but on the opposite side.

**Primary recommendation:** Add a `tasks` Dexie table and `columns` settings record, create a Zustand task store following the notes-store pattern, extend AppShell with a right panel using the same margin-transition approach as the left sidebar, and use dnd-kit's multiple SortableContext pattern for kanban column drag-and-drop.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Right sidebar panel (280px, pushes main content with margin transition, toggle via icon button in header bar area top-right)
- Panel open/closed state persists across sessions via settings storage
- Panel coexists with left sidebar (both can be open simultaneously)
- Kanban board renders in full main content area (replaces editor)
- Fixed "Kanban Board" entry in left sidebar below page tree
- Default 3 columns: To Do, In Progress, Done
- Fully customizable columns (add, rename, delete, reorder)
- Columns scroll horizontally on overflow
- Title-only minimal cards (no description, labels, or dates in v1)
- Unified data model: one task type shared between todo panel and kanban board
- Todo panel shows all non-completed tasks (not in "Done" column)
- Checking a todo moves it to "Done" column in kanban
- Adding a todo from panel places it in first column ("To Do")
- Kanban shows all tasks grouped by column including completed
- Drag-and-drop in both views: reorder in todo panel, move between columns in kanban

### Claude's Discretion
- Exact task data schema and Dexie table design
- Drag-and-drop library choice and implementation (dnd-kit already installed)
- Todo panel empty state design
- Kanban board empty state (no columns or no cards)
- Add-task input UX details (inline input at bottom of panel vs floating input)
- Column header styling and add-column UX
- Animation and transition timing for panel toggle and card drag

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TODO-01 | User can see a dedicated todo panel on the new tab page | Right sidebar panel pattern (mirrors left sidebar), AppShell extension, UI store state |
| TODO-02 | User can add, edit, complete, and delete todos from the panel | Task store CRUD operations, Dexie tasks table, inline input pattern |
| TODO-03 | User can mark todos as complete with checkbox toggle | Unified data model -- toggling complete moves task to "Done" column |
| TODO-04 | Todo panel persists state across tab opens | Dexie tasks table + settings storage for panel open/closed state |
| TODO-05 | User can reorder todos via drag-and-drop | dnd-kit SortableContext with verticalListSortingStrategy in todo panel |
| KANB-01 | User can view todos/tasks in a kanban board layout | KanbanBoard component in main content area, multiple SortableContext containers |
| KANB-02 | User can create kanban columns | Column CRUD in task store, columns stored in Dexie settings |
| KANB-03 | User can drag cards between columns | dnd-kit onDragOver handler for cross-container moves |
| KANB-04 | User can add, edit, and delete kanban cards | Task store CRUD (same operations as todo panel, different UI) |
| KANB-05 | Kanban state persists across tab opens | Dexie tasks table + columns settings record |
</phase_requirements>

## Standard Stack

### Core (already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @dnd-kit/core | 6.3.1 | Drag-and-drop primitives | Already installed. DndContext, sensors, collision detection |
| @dnd-kit/sortable | 10.0.0 | Sortable lists and containers | Already installed. SortableContext, useSortable, sorting strategies |
| @dnd-kit/utilities | 3.2.2 | CSS utility transforms | Already installed. CSS.Transform for drag styles |
| Dexie.js | 4.3.0 | IndexedDB storage | Already installed. Tasks table follows notes table pattern |
| Zustand | 5.0.12 | State management | Already installed. Task store follows notes-store pattern |

### No new dependencies needed

All required libraries are already in `package.json`. The dnd-kit packages cover both the todo panel sortable list and the kanban board multi-container drag-and-drop.

## Architecture Patterns

### Recommended Component Structure

```
components/
  todo/
    TodoPanel.tsx          # Right sidebar panel container
    TodoItem.tsx           # Individual todo with checkbox, title, drag handle
    TodoInput.tsx          # Inline add-task input at bottom of panel
    TodoPanelToggle.tsx    # Toggle button for top-right header area
  kanban/
    KanbanBoard.tsx        # Full board with horizontal scrolling columns
    KanbanColumn.tsx       # Single column (droppable container + sortable items)
    KanbanCard.tsx         # Minimal title-only card
    KanbanColumnHeader.tsx # Column title (editable) + add card button
    AddColumnButton.tsx    # Button to add new column at end
lib/
  stores/
    task-store.ts          # Zustand store for tasks + columns
  storage/
    db.ts                  # Add tasks table (version 2 migration)
    types.ts               # Add TaskRecord, KanbanColumn types
```

### Pattern 1: Unified Task Data Model

**What:** Single data model shared between todo panel and kanban board.
**When to use:** Always -- this is a locked decision.

```typescript
// types.ts
interface TaskRecord {
  id: string;
  title: string;
  columnId: string;      // References a KanbanColumn.id
  order: number;         // Sort position within column
  createdAt: number;
  updatedAt: number;
}

interface KanbanColumn {
  id: string;
  title: string;
  order: number;         // Column sort position
}

interface KanbanState {
  columns: KanbanColumn[];
  updatedAt: number;
}
```

**Key insight:** The `columnId` field unifies both views. The todo panel filters tasks where `columnId !== doneColumnId`. The kanban board groups tasks by `columnId`. "Completing" a todo just means setting `columnId` to the Done column's ID.

### Pattern 2: Dexie Schema Version Migration

**What:** Bump Dexie version to add tasks table alongside existing notes and settings tables.
**When to use:** When adding the tasks table.

```typescript
// db.ts - updated
class NewTabDB extends Dexie {
  notes!: EntityTable<NoteRecord, 'id'>;
  settings!: EntityTable<SettingsRecord, 'key'>;
  tasks!: EntityTable<TaskRecord, 'id'>;

  constructor() {
    super('newtab-db');
    this.version(1).stores({
      notes: 'id, parentId, updatedAt',
      settings: 'key',
    });
    this.version(2).stores({
      notes: 'id, parentId, updatedAt',
      settings: 'key',
      tasks: 'id, columnId, order',
    });
  }
}
```

**Key insight:** Dexie handles version upgrades automatically. Existing data in `notes` and `settings` tables is preserved. The `columnId` and `order` indexes on tasks enable efficient queries for kanban column grouping and sorting.

### Pattern 3: Right Panel Layout (mirrors left sidebar)

**What:** AppShell extended with a right panel using the same margin-transition push pattern.
**When to use:** For the todo panel.

```typescript
// AppShell.tsx - extended
<div className="flex h-screen w-screen bg-bg text-text-primary font-mono">
  <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar}>
    {/* existing sidebar content */}
    {/* Add fixed "Kanban Board" entry below PageTree */}
  </Sidebar>

  <div
    className={`flex-1 transition-all duration-[250ms] ease-in-out ${
      sidebarOpen ? 'ml-[240px]' : 'ml-0'
    } ${todoPanelOpen ? 'mr-[280px]' : 'mr-0'}`}
  >
    <MainContent>
      {/* Conditionally render Editor or KanbanBoard based on active view */}
    </MainContent>
  </div>

  <TodoPanel isOpen={todoPanelOpen} onToggle={toggleTodoPanel} />
</div>
```

**Key insight:** The right panel uses `mr-[280px]` transition matching the left sidebar's `ml-[240px]` pattern. Both panels push the main content -- they do not overlay.

### Pattern 4: dnd-kit Multi-Container Kanban

**What:** Each kanban column is a SortableContext with useDroppable, wrapped in a single DndContext.
**When to use:** For the kanban board.

```typescript
// KanbanBoard.tsx
<DndContext
  sensors={sensors}
  collisionDetection={closestCorners}
  onDragStart={handleDragStart}
  onDragOver={handleDragOver}
  onDragEnd={handleDragEnd}
>
  <div className="flex gap-4 overflow-x-auto h-full p-4">
    {columns.map((column) => (
      <KanbanColumn key={column.id} column={column} tasks={tasksByColumn[column.id]} />
    ))}
    <AddColumnButton />
  </div>
  <DragOverlay>
    {activeTask ? <KanbanCard task={activeTask} isOverlay /> : null}
  </DragOverlay>
</DndContext>
```

```typescript
// KanbanColumn.tsx
function KanbanColumn({ column, tasks }: Props) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div ref={setNodeRef} className="w-[272px] flex-shrink-0 flex flex-col">
      <KanbanColumnHeader column={column} />
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}
      </SortableContext>
    </div>
  );
}
```

### Pattern 5: dnd-kit Sortable Todo List

**What:** Single SortableContext for the flat todo list.
**When to use:** For the todo panel reordering.

```typescript
// TodoPanel.tsx
<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  <SortableContext items={todoIds} strategy={verticalListSortingStrategy}>
    {todos.map((task) => (
      <TodoItem key={task.id} task={task} />
    ))}
  </SortableContext>
</DndContext>
```

### Pattern 6: Zustand Task Store (follows notes-store pattern)

**What:** Task store with async init, cache, and Dexie persistence.
**When to use:** For all task state management.

```typescript
// task-store.ts
interface TaskState {
  tasks: TaskRecord[];
  columns: KanbanColumn[];
  initialized: boolean;
  activeView: 'editor' | 'kanban';

  initialize: () => Promise<void>;
  addTask: (title: string) => Promise<TaskRecord>;
  updateTask: (id: string, updates: Partial<TaskRecord>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  uncompleteTask: (id: string) => Promise<void>;
  reorderTask: (id: string, newColumnId: string, newOrder: number) => Promise<void>;
  addColumn: (title: string) => Promise<void>;
  renameColumn: (id: string, title: string) => Promise<void>;
  deleteColumn: (id: string) => Promise<void>;
  reorderColumn: (id: string, newOrder: number) => Promise<void>;
  setActiveView: (view: 'editor' | 'kanban') => void;
}
```

### Anti-Patterns to Avoid

- **Separate data models for todo and kanban:** Creates sync nightmares. Use one TaskRecord with columnId.
- **Storing column assignments in a separate junction table:** Over-normalized for this use case. columnId on TaskRecord is sufficient.
- **Using DndContext inside each column separately:** Prevents cross-column drag. Use one DndContext wrapping all columns.
- **Overlay-style right panel:** Locked decision says push content with margin, not overlay.
- **Direct Dexie access from components:** All DB operations go through storage-service or the store.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sortable lists | Custom drag handlers with mouse/touch events | @dnd-kit/sortable useSortable hook | Touch support, accessibility, keyboard DnD, collision detection all handled |
| Multi-container DnD | Custom container detection logic | @dnd-kit closestCorners + onDragOver | Finding the correct container during cross-column drag is hard to get right |
| Drag overlay rendering | Cloning DOM nodes manually | DragOverlay component from @dnd-kit/core | Handles portal rendering, smooth animations, proper z-index |
| Order recalculation | Manual array index management | arrayMove from @dnd-kit/sortable | Handles reorder within and across containers correctly |
| Schema migration | Manual IndexedDB upgrade | Dexie version() chain | Handles upgrades, preserves existing data, handles edge cases |

**Key insight:** dnd-kit handles the hard parts of DnD (touch, accessibility, keyboard, collision detection, overlay rendering). The only custom logic needed is the state management in onDragStart/onDragOver/onDragEnd handlers.

## Common Pitfalls

### Pitfall 1: Cross-Container Drag Detection Failure
**What goes wrong:** Items can be sorted within a column but cannot be dragged to a different column.
**Why it happens:** Missing `onDragOver` handler. The `onDragEnd` alone only handles drops, not the real-time container switching needed for kanban.
**How to avoid:** Implement `onDragOver` to detect when an item moves over a different container and update state to "move" the item to the new column in real-time. Use `closestCorners` collision detection (not `closestCenter`) for multi-container setups.
**Warning signs:** Items snap back to original column on drop.

### Pitfall 2: DragOverlay Not Used (Flickering)
**What goes wrong:** Dragged items flicker or disappear during drag because the original item is being moved in the DOM.
**Why it happens:** Without DragOverlay, the sortable item itself moves, causing re-renders and layout shifts.
**How to avoid:** Always use `<DragOverlay>` for the visual drag preview. Hide the original item during drag (set opacity to 0 or display none via the `isDragging` state from `useSortable`).
**Warning signs:** Visual glitches during drag, items briefly disappearing.

### Pitfall 3: Dexie Version Not Bumped
**What goes wrong:** New `tasks` table is not created, queries fail with "table not found."
**Why it happens:** Adding a table to Dexie requires incrementing the version number. If version stays at 1, Dexie won't create the new table.
**How to avoid:** Add `this.version(2).stores({...})` that includes all existing tables plus the new tasks table. Dexie requires all tables be listed in the latest version, not just new ones.
**Warning signs:** Console errors about missing table, empty task lists despite adding tasks.

### Pitfall 4: Todo Panel and Kanban Board Out of Sync
**What goes wrong:** Adding a task in the todo panel doesn't appear in kanban, or completing in kanban doesn't update the todo panel.
**Why it happens:** Separate state or separate data sources for each view.
**How to avoid:** Single Zustand task store consumed by both views. Both derive their display from the same `tasks[]` array. Todo panel filters by `columnId !== doneColumnId`. Kanban groups by `columnId`.
**Warning signs:** Stale data in one view after changes in the other.

### Pitfall 5: Column Deletion Orphans Tasks
**What goes wrong:** Deleting a kanban column leaves tasks referencing a non-existent columnId.
**Why it happens:** Column delete doesn't handle associated tasks.
**How to avoid:** When deleting a column, move all its tasks to the first remaining column (or delete them, with a confirmation dialog). Never leave orphaned tasks.
**Warning signs:** Tasks disappear from both views after column deletion.

### Pitfall 6: SortableContext items Array Mismatch
**What goes wrong:** Sorting stops working or items jump unexpectedly.
**Why it happens:** The `items` prop on SortableContext must match exactly the IDs of rendered sortable children, in the correct order.
**How to avoid:** Derive the items array from the same sorted data source that renders the children. Never have a child with an ID not in the items array.
**Warning signs:** Console warnings from dnd-kit, items jumping to wrong positions.

### Pitfall 7: ID Collision Between Containers and Items
**What goes wrong:** dnd-kit confuses a column container with a task item during drag.
**Why it happens:** Column IDs and task IDs can collide if both use `crypto.randomUUID()` without prefixes.
**How to avoid:** Use a prefix convention: column IDs like `col-{uuid}` and task IDs like `task-{uuid}`, or ensure the findContainer logic checks against known column IDs first.
**Warning signs:** Dragging a card triggers column reordering instead.

## Code Examples

### onDragOver Handler (cross-column card move)

```typescript
// Source: dnd-kit multi-container pattern (community standard)
function handleDragOver(event: DragOverEvent) {
  const { active, over } = event;
  if (!over) return;

  const activeId = active.id as string;
  const overId = over.id as string;

  const activeColumn = findColumnForTask(activeId);
  const overColumn = findColumnForTask(overId) ?? overId; // overId might be a column

  if (!activeColumn || !overColumn || activeColumn === overColumn) return;

  // Move task from activeColumn to overColumn
  setTasks((prev) => {
    const activeItems = prev.filter((t) => t.columnId === activeColumn);
    const overItems = prev.filter((t) => t.columnId === overColumn);
    const activeIndex = activeItems.findIndex((t) => t.id === activeId);
    const overIndex = overItems.findIndex((t) => t.id === overId);

    const newIndex = overIndex >= 0 ? overIndex : overItems.length;

    return prev.map((t) =>
      t.id === activeId ? { ...t, columnId: overColumn, order: newIndex } : t
    );
  });
}
```

### onDragEnd Handler (persist reorder)

```typescript
// Source: dnd-kit sortable pattern
function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;
  setActiveTaskId(null); // Clear overlay

  if (!over || active.id === over.id) return;

  const activeColumn = findColumnForTask(active.id as string);
  const overColumn = findColumnForTask(over.id as string) ?? (over.id as string);

  if (activeColumn === overColumn) {
    // Reorder within same column
    const columnTasks = getTasksForColumn(activeColumn);
    const oldIndex = columnTasks.findIndex((t) => t.id === active.id);
    const newIndex = columnTasks.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(columnTasks, oldIndex, newIndex);

    // Update order fields and persist
    reordered.forEach((task, i) => {
      taskStore.updateTaskOrder(task.id, activeColumn, i);
    });
  }
  // Cross-column move already handled in onDragOver
}
```

### Sensors Configuration

```typescript
import { useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: { distance: 5 }, // 5px drag threshold to avoid accidental drags
  }),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
);
```

### Default Columns Initialization

```typescript
// task-store.ts initialize()
const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: `col-${crypto.randomUUID()}`, title: 'To Do', order: 0 },
  { id: `col-${crypto.randomUUID()}`, title: 'In Progress', order: 1 },
  { id: `col-${crypto.randomUUID()}`, title: 'Done', order: 2 },
];

initialize: async () => {
  if (get().initialized) return;
  const kanbanState = await db.settings.get('kanban-columns');
  const columns = kanbanState
    ? (kanbanState.value as KanbanState).columns
    : DEFAULT_COLUMNS;

  if (!kanbanState) {
    // First run: persist default columns
    await db.settings.put({ key: 'kanban-columns', value: { columns, updatedAt: Date.now() } });
  }

  const tasks = await db.tasks.toArray();
  set({ columns, tasks, initialized: true });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-beautiful-dnd | @dnd-kit/sortable | 2024 (rbd unmaintained) | dnd-kit is already installed in this project |
| @hello-pangea/dnd (rbd fork) | @dnd-kit/sortable | 2024-2025 | dnd-kit has better multi-container support |
| Separate todo and kanban data models | Unified task model with columnId | Current best practice | Single source of truth, no sync issues |

**Deprecated/outdated:**
- `react-beautiful-dnd`: Unmaintained by Atlassian. Use @dnd-kit instead (already installed).
- `@hello-pangea/dnd`: Listed in STACK.md as option but dnd-kit is already installed and more suitable for multi-container kanban.

## Open Questions

1. **Column deletion behavior**
   - What we know: User can delete columns. Tasks in that column need to go somewhere.
   - What's unclear: Move to first column? Show confirmation? Delete tasks?
   - Recommendation: Move tasks to first column with a toast notification. If deleting the last column, prevent deletion.

2. **Todo panel order vs kanban column order**
   - What we know: Todo panel shows non-completed tasks. Kanban has per-column ordering.
   - What's unclear: Does todo panel have its own sort order independent of kanban column order?
   - Recommendation: Todo panel sorts by a separate `todoPanelOrder` field (or simply by `order` within columns, flattened). Users reorder in the todo panel independently of kanban position.

3. **Maximum number of columns**
   - What we know: Columns are fully customizable, scroll horizontally.
   - What's unclear: Should there be a max?
   - Recommendation: No hard limit. Horizontal scroll handles overflow naturally. Column width fixed at ~272px.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --reporter=verbose` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TODO-01 | Todo panel renders in right sidebar | unit | `npx vitest run tests/todo-panel.test.tsx -t "renders"` | No - Wave 0 |
| TODO-02 | Add, edit, complete, delete todos | unit | `npx vitest run tests/task-store.test.ts -t "crud"` | No - Wave 0 |
| TODO-03 | Checkbox toggle moves task to Done column | unit | `npx vitest run tests/task-store.test.ts -t "complete"` | No - Wave 0 |
| TODO-04 | Tasks persist via Dexie | unit | `npx vitest run tests/task-store.test.ts -t "persist"` | No - Wave 0 |
| TODO-05 | Todo reorder via drag-and-drop | manual-only | Manual (dnd-kit requires real DOM interactions) | N/A |
| KANB-01 | Kanban board displays tasks in columns | unit | `npx vitest run tests/kanban-board.test.tsx -t "columns"` | No - Wave 0 |
| KANB-02 | Create/rename/delete kanban columns | unit | `npx vitest run tests/task-store.test.ts -t "column"` | No - Wave 0 |
| KANB-03 | Drag cards between columns | manual-only | Manual (cross-container DnD requires real DOM) | N/A |
| KANB-04 | Add, edit, delete kanban cards | unit | `npx vitest run tests/task-store.test.ts -t "crud"` | No - Wave 0 |
| KANB-05 | Kanban state persists | unit | `npx vitest run tests/task-store.test.ts -t "persist"` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/task-store.test.ts` -- covers TODO-02, TODO-03, TODO-04, KANB-02, KANB-04, KANB-05 (store CRUD + persistence)
- [ ] `tests/todo-panel.test.tsx` -- covers TODO-01 (panel rendering)
- [ ] `tests/kanban-board.test.tsx` -- covers KANB-01 (board layout rendering)
- [ ] Dexie mock setup for tasks table in test environment

## Sources

### Primary (HIGH confidence)
- Project codebase: `lib/storage/db.ts`, `lib/stores/notes-store.ts`, `lib/stores/ui-store.ts`, `components/layout/AppShell.tsx` -- established patterns
- [dnd-kit official docs](https://docs.dndkit.com/presets/sortable) -- SortableContext, strategies, multi-container pattern
- [Dexie.js docs](https://dexie.org/) -- version migration, table schema

### Secondary (MEDIUM confidence)
- [Kanban board with dnd-kit (radzion.com)](https://radzion.com/blog/kanban/) -- multi-container DnD pattern with onDragOver
- [LogRocket dnd-kit kanban tutorial](https://blog.logrocket.com/build-kanban-board-dnd-kit-react/) -- KanbanBoard/KanbanLane/KanbanCard structure
- [dnd-kit multiple containers (DeepWiki)](https://deepwiki.com/clauderic/dnd-kit/4.4-multiple-containers) -- cross-container drag detection

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and versions verified against npm registry
- Architecture: HIGH -- follows established patterns from Phase 1 codebase (notes-store, AppShell, sidebar toggle)
- Pitfalls: HIGH -- well-documented dnd-kit patterns, common kanban board challenges are widely covered
- Data model: HIGH -- unified task model with columnId is a straightforward and proven approach

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (stable -- no fast-moving dependencies)
