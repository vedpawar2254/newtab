import { create } from 'zustand';
import { db } from '../storage/db';
import type { TaskRecord, KanbanColumn, KanbanState } from '../storage/types';

interface TaskState {
  tasks: TaskRecord[];
  columns: KanbanColumn[];
  initialized: boolean;
  activeView: 'editor' | 'kanban';

  initialize: () => Promise<void>;
  addTask: (title: string) => Promise<TaskRecord>;
  updateTask: (id: string, updates: Partial<Pick<TaskRecord, 'title'>>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  uncompleteTask: (id: string) => Promise<void>;
  reorderTask: (id: string, newColumnId: string, newOrder: number) => Promise<void>;
  addColumn: (title: string) => Promise<KanbanColumn>;
  renameColumn: (id: string, title: string) => Promise<void>;
  deleteColumn: (id: string) => Promise<boolean>;
  reorderColumn: (id: string, newOrder: number) => Promise<void>;
  setActiveView: (view: 'editor' | 'kanban') => void;
  getDoneColumnId: () => string | undefined;
  getFirstColumnId: () => string | undefined;
}

function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

async function persistColumns(columns: KanbanColumn[]): Promise<void> {
  await db.settings.put({
    key: 'kanban-columns',
    value: { columns, updatedAt: Date.now() } as KanbanState,
  });
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  columns: [],
  initialized: false,
  activeView: 'editor',

  initialize: async () => {
    if (get().initialized) return;

    const kanbanState = await db.settings.get('kanban-columns');
    let columns: KanbanColumn[];

    if (kanbanState) {
      columns = (kanbanState.value as KanbanState).columns;
    } else {
      columns = [
        { id: generateId('col'), title: 'To Do', order: 0 },
        { id: generateId('col'), title: 'In Progress', order: 1 },
        { id: generateId('col'), title: 'Done', order: 2 },
      ];
      await persistColumns(columns);
    }

    const tasks = await db.tasks.toArray();
    set({ columns, tasks, initialized: true });
  },

  addTask: async (title: string) => {
    const { columns, tasks } = get();
    const firstColumnId = columns.length > 0
      ? columns.reduce((a, b) => (a.order < b.order ? a : b)).id
      : '';

    const columnTasks = tasks.filter(t => t.columnId === firstColumnId);
    const now = Date.now();
    const task: TaskRecord = {
      id: generateId('task'),
      title,
      columnId: firstColumnId,
      order: columnTasks.length,
      createdAt: now,
      updatedAt: now,
    };

    await db.tasks.put(task);
    set(s => ({ tasks: [...s.tasks, task] }));
    return task;
  },

  updateTask: async (id: string, updates: Partial<Pick<TaskRecord, 'title'>>) => {
    const { tasks } = get();
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const updated = { ...task, ...updates, updatedAt: Date.now() };
    await db.tasks.put(updated);
    set(s => ({ tasks: s.tasks.map(t => t.id === id ? updated : t) }));
  },

  deleteTask: async (id: string) => {
    await db.tasks.delete(id);
    set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }));
  },

  completeTask: async (id: string) => {
    const { columns, tasks } = get();
    if (columns.length === 0) return;

    const doneColumn = columns.reduce((a, b) => (a.order > b.order ? a : b));
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const doneTasks = tasks.filter(t => t.columnId === doneColumn.id);
    const updated = {
      ...task,
      columnId: doneColumn.id,
      order: doneTasks.length,
      updatedAt: Date.now(),
    };
    await db.tasks.put(updated);
    set(s => ({ tasks: s.tasks.map(t => t.id === id ? updated : t) }));
  },

  uncompleteTask: async (id: string) => {
    const { columns, tasks } = get();
    if (columns.length === 0) return;

    const firstColumn = columns.reduce((a, b) => (a.order < b.order ? a : b));
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const firstColTasks = tasks.filter(t => t.columnId === firstColumn.id);
    const updated = {
      ...task,
      columnId: firstColumn.id,
      order: firstColTasks.length,
      updatedAt: Date.now(),
    };
    await db.tasks.put(updated);
    set(s => ({ tasks: s.tasks.map(t => t.id === id ? updated : t) }));
  },

  reorderTask: async (id: string, newColumnId: string, newOrder: number) => {
    const { tasks } = get();
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const oldColumnId = task.columnId;

    // Update the moved task
    const now = Date.now();
    const updatedTask = { ...task, columnId: newColumnId, order: newOrder, updatedAt: now };

    // Build new tasks array
    let newTasks = tasks.map(t => t.id === id ? updatedTask : t);

    // Re-index tasks in the new column (excluding and re-inserting the moved task)
    const newColTasks = newTasks
      .filter(t => t.columnId === newColumnId && t.id !== id)
      .sort((a, b) => a.order - b.order);

    // Insert the moved task at the correct position
    newColTasks.splice(newOrder, 0, updatedTask);

    // Assign sequential orders
    const reindexed = new Map<string, number>();
    newColTasks.forEach((t, i) => reindexed.set(t.id, i));

    // If cross-column move, re-index old column too
    if (oldColumnId !== newColumnId) {
      const oldColTasks = newTasks
        .filter(t => t.columnId === oldColumnId)
        .sort((a, b) => a.order - b.order);
      oldColTasks.forEach((t, i) => reindexed.set(t.id, i));
    }

    // Apply reindexed orders
    newTasks = newTasks.map(t => {
      const newOrd = reindexed.get(t.id);
      if (newOrd !== undefined && newOrd !== t.order) {
        return { ...t, order: newOrd };
      }
      return t;
    });

    // Persist all affected tasks
    const affectedTasks = newTasks.filter(
      t => t.columnId === newColumnId || t.columnId === oldColumnId
    );
    await db.tasks.bulkPut(affectedTasks);

    set({ tasks: newTasks });
  },

  addColumn: async (title: string) => {
    const { columns } = get();
    const maxOrder = columns.length > 0
      ? Math.max(...columns.map(c => c.order))
      : -1;

    const column: KanbanColumn = {
      id: generateId('col'),
      title,
      order: maxOrder + 1,
    };

    const newColumns = [...columns, column];
    await persistColumns(newColumns);
    set({ columns: newColumns });
    return column;
  },

  renameColumn: async (id: string, title: string) => {
    const { columns } = get();
    const newColumns = columns.map(c => c.id === id ? { ...c, title } : c);
    await persistColumns(newColumns);
    set({ columns: newColumns });
  },

  deleteColumn: async (id: string) => {
    const { columns, tasks } = get();
    if (columns.length <= 1) return false;

    const remainingColumns = columns.filter(c => c.id !== id);
    const firstColumn = remainingColumns.reduce((a, b) => (a.order < b.order ? a : b));

    // Move tasks from deleted column to first remaining column
    const firstColTaskCount = tasks.filter(t => t.columnId === firstColumn.id).length;
    let offset = firstColTaskCount;

    const newTasks = tasks.map(t => {
      if (t.columnId === id) {
        const moved = { ...t, columnId: firstColumn.id, order: offset, updatedAt: Date.now() };
        offset++;
        return moved;
      }
      return t;
    });

    // Persist moved tasks
    const movedTasks = newTasks.filter(t => tasks.find(orig => orig.id === t.id && orig.columnId === id));
    if (movedTasks.length > 0) {
      await db.tasks.bulkPut(movedTasks);
    }

    await persistColumns(remainingColumns);
    set({ columns: remainingColumns, tasks: newTasks });
    return true;
  },

  reorderColumn: async (id: string, newOrder: number) => {
    const { columns } = get();
    const col = columns.find(c => c.id === id);
    if (!col) return;

    // Remove column from array and re-insert at new position
    const without = columns.filter(c => c.id !== id).sort((a, b) => a.order - b.order);
    without.splice(newOrder, 0, col);

    // Reassign sequential orders
    const reordered = without.map((c, i) => ({ ...c, order: i }));

    await persistColumns(reordered);
    set({ columns: reordered });
  },

  setActiveView: (view: 'editor' | 'kanban') => {
    set({ activeView: view });
  },

  getDoneColumnId: () => {
    const { columns } = get();
    if (columns.length === 0) return undefined;
    return columns.reduce((a, b) => (a.order > b.order ? a : b)).id;
  },

  getFirstColumnId: () => {
    const { columns } = get();
    if (columns.length === 0) return undefined;
    return columns.reduce((a, b) => (a.order < b.order ? a : b)).id;
  },
}));
