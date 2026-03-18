import { describe, it, expect, vi, beforeEach } from 'vitest';

// In-memory mock stores
let tasksStore: Map<string, any>;
let settingsStore: Map<string, any>;

vi.mock('../lib/storage/db', () => {
  tasksStore = new Map();
  settingsStore = new Map();
  return {
    db: {
      tasks: {
        get: vi.fn(async (id: string) => tasksStore.get(id)),
        put: vi.fn(async (task: any) => { tasksStore.set(task.id, task); }),
        delete: vi.fn(async (id: string) => { tasksStore.delete(id); }),
        toArray: vi.fn(async () => Array.from(tasksStore.values())),
        bulkPut: vi.fn(async (items: any[]) => {
          for (const item of items) tasksStore.set(item.id, item);
        }),
      },
      settings: {
        get: vi.fn(async (key: string) => settingsStore.get(key)),
        put: vi.fn(async (record: any) => { settingsStore.set(record.key, record); }),
      },
      notes: {
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        toArray: vi.fn(async () => []),
      },
    },
  };
});

import { db } from '../lib/storage/db';

describe('types', () => {
  it('TaskRecord interface has required fields', async () => {
    const { TaskRecordFields } = await import('../lib/storage/types');
    // We check the types exist by importing and verifying they can be used
    const task: import('../lib/storage/types').TaskRecord = {
      id: 'task-1',
      title: 'Test',
      columnId: 'col-1',
      order: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    expect(task.id).toBe('task-1');
    expect(task.title).toBe('Test');
    expect(task.columnId).toBe('col-1');
    expect(typeof task.order).toBe('number');
    expect(typeof task.createdAt).toBe('number');
    expect(typeof task.updatedAt).toBe('number');
  });

  it('KanbanColumn interface has required fields', async () => {
    const col: import('../lib/storage/types').KanbanColumn = {
      id: 'col-1',
      title: 'To Do',
      order: 0,
    };
    expect(col.id).toBe('col-1');
    expect(col.title).toBe('To Do');
    expect(typeof col.order).toBe('number');
  });

  it('KanbanState interface has columns and updatedAt', async () => {
    const state: import('../lib/storage/types').KanbanState = {
      columns: [{ id: 'col-1', title: 'To Do', order: 0 }],
      updatedAt: Date.now(),
    };
    expect(state.columns).toHaveLength(1);
    expect(typeof state.updatedAt).toBe('number');
  });
});

describe('initialize', () => {
  beforeEach(() => {
    tasksStore.clear();
    settingsStore.clear();
    vi.clearAllMocks();
  });

  it('loads default columns on first run', async () => {
    const { useTaskStore } = await import('../lib/stores/task-store');
    useTaskStore.setState({ tasks: [], columns: [], initialized: false, activeView: 'editor' });

    await useTaskStore.getState().initialize();

    const state = useTaskStore.getState();
    expect(state.initialized).toBe(true);
    expect(state.columns).toHaveLength(3);
    expect(state.columns[0].title).toBe('To Do');
    expect(state.columns[1].title).toBe('In Progress');
    expect(state.columns[2].title).toBe('Done');
  });

  it('loads existing columns from settings on subsequent runs', async () => {
    const existingColumns = [
      { id: 'col-a', title: 'Backlog', order: 0 },
      { id: 'col-b', title: 'Active', order: 1 },
    ];
    settingsStore.set('kanban-columns', {
      key: 'kanban-columns',
      value: { columns: existingColumns, updatedAt: Date.now() },
    });

    const { useTaskStore } = await import('../lib/stores/task-store');
    useTaskStore.setState({ tasks: [], columns: [], initialized: false, activeView: 'editor' });

    await useTaskStore.getState().initialize();

    const state = useTaskStore.getState();
    expect(state.columns).toHaveLength(2);
    expect(state.columns[0].title).toBe('Backlog');
    expect(state.columns[1].title).toBe('Active');
  });
});

describe('crud', () => {
  beforeEach(() => {
    tasksStore.clear();
    settingsStore.clear();
    vi.clearAllMocks();
  });

  it('addTask creates task with first column id', async () => {
    const { useTaskStore } = await import('../lib/stores/task-store');
    useTaskStore.setState({ tasks: [], columns: [], initialized: false, activeView: 'editor' });
    await useTaskStore.getState().initialize();

    const task = await useTaskStore.getState().addTask('My task');
    expect(task.title).toBe('My task');
    expect(task.id).toMatch(/^task-/);
    expect(task.columnId).toBe(useTaskStore.getState().columns[0].id);
    expect(useTaskStore.getState().tasks).toHaveLength(1);
  });

  it('updateTask changes title', async () => {
    const { useTaskStore } = await import('../lib/stores/task-store');
    useTaskStore.setState({ tasks: [], columns: [], initialized: false, activeView: 'editor' });
    await useTaskStore.getState().initialize();

    const task = await useTaskStore.getState().addTask('Original');
    await useTaskStore.getState().updateTask(task.id, { title: 'Updated' });

    const updated = useTaskStore.getState().tasks.find(t => t.id === task.id);
    expect(updated?.title).toBe('Updated');
  });

  it('deleteTask removes task from store', async () => {
    const { useTaskStore } = await import('../lib/stores/task-store');
    useTaskStore.setState({ tasks: [], columns: [], initialized: false, activeView: 'editor' });
    await useTaskStore.getState().initialize();

    const task = await useTaskStore.getState().addTask('To delete');
    expect(useTaskStore.getState().tasks).toHaveLength(1);

    await useTaskStore.getState().deleteTask(task.id);
    expect(useTaskStore.getState().tasks).toHaveLength(0);
  });
});

describe('complete', () => {
  beforeEach(() => {
    tasksStore.clear();
    settingsStore.clear();
    vi.clearAllMocks();
  });

  it('completeTask moves task to last column', async () => {
    const { useTaskStore } = await import('../lib/stores/task-store');
    useTaskStore.setState({ tasks: [], columns: [], initialized: false, activeView: 'editor' });
    await useTaskStore.getState().initialize();

    const task = await useTaskStore.getState().addTask('Complete me');
    const doneColumnId = useTaskStore.getState().columns[2].id;

    await useTaskStore.getState().completeTask(task.id);

    const completed = useTaskStore.getState().tasks.find(t => t.id === task.id);
    expect(completed?.columnId).toBe(doneColumnId);
  });

  it('uncompleteTask moves task to first column', async () => {
    const { useTaskStore } = await import('../lib/stores/task-store');
    useTaskStore.setState({ tasks: [], columns: [], initialized: false, activeView: 'editor' });
    await useTaskStore.getState().initialize();

    const task = await useTaskStore.getState().addTask('Complete then undo');
    await useTaskStore.getState().completeTask(task.id);

    const firstColumnId = useTaskStore.getState().columns[0].id;
    await useTaskStore.getState().uncompleteTask(task.id);

    const uncompleted = useTaskStore.getState().tasks.find(t => t.id === task.id);
    expect(uncompleted?.columnId).toBe(firstColumnId);
  });
});

describe('column crud', () => {
  beforeEach(() => {
    tasksStore.clear();
    settingsStore.clear();
    vi.clearAllMocks();
  });

  it('addColumn creates a new column', async () => {
    const { useTaskStore } = await import('../lib/stores/task-store');
    useTaskStore.setState({ tasks: [], columns: [], initialized: false, activeView: 'editor' });
    await useTaskStore.getState().initialize();

    const col = await useTaskStore.getState().addColumn('Review');
    expect(col.title).toBe('Review');
    expect(useTaskStore.getState().columns).toHaveLength(4);
  });

  it('renameColumn updates column title', async () => {
    const { useTaskStore } = await import('../lib/stores/task-store');
    useTaskStore.setState({ tasks: [], columns: [], initialized: false, activeView: 'editor' });
    await useTaskStore.getState().initialize();

    const colId = useTaskStore.getState().columns[1].id;
    await useTaskStore.getState().renameColumn(colId, 'Working On');

    const renamed = useTaskStore.getState().columns.find(c => c.id === colId);
    expect(renamed?.title).toBe('Working On');
  });

  it('deleteColumn moves tasks to first remaining column', async () => {
    const { useTaskStore } = await import('../lib/stores/task-store');
    useTaskStore.setState({ tasks: [], columns: [], initialized: false, activeView: 'editor' });
    await useTaskStore.getState().initialize();

    // Add a task to the second column
    const task = await useTaskStore.getState().addTask('In progress task');
    const secondColId = useTaskStore.getState().columns[1].id;
    await useTaskStore.getState().reorderTask(task.id, secondColId, 0);

    // Delete second column
    const result = await useTaskStore.getState().deleteColumn(secondColId);
    expect(result).toBe(true);
    expect(useTaskStore.getState().columns).toHaveLength(2);

    // Task should be in first column
    const movedTask = useTaskStore.getState().tasks.find(t => t.id === task.id);
    expect(movedTask?.columnId).toBe(useTaskStore.getState().columns[0].id);
  });

  it('deleteColumn prevents deleting last column', async () => {
    const { useTaskStore } = await import('../lib/stores/task-store');
    useTaskStore.setState({ tasks: [], columns: [], initialized: false, activeView: 'editor' });
    await useTaskStore.getState().initialize();

    // Delete columns until one remains
    const cols = useTaskStore.getState().columns;
    await useTaskStore.getState().deleteColumn(cols[2].id);
    await useTaskStore.getState().deleteColumn(cols[1].id);

    // Trying to delete the last one should fail
    const lastCol = useTaskStore.getState().columns[0];
    const result = await useTaskStore.getState().deleteColumn(lastCol.id);
    expect(result).toBe(false);
    expect(useTaskStore.getState().columns).toHaveLength(1);
  });

  it('reorderColumn changes column order', async () => {
    const { useTaskStore } = await import('../lib/stores/task-store');
    useTaskStore.setState({ tasks: [], columns: [], initialized: false, activeView: 'editor' });
    await useTaskStore.getState().initialize();

    const cols = useTaskStore.getState().columns;
    const lastCol = cols[2]; // Done

    await useTaskStore.getState().reorderColumn(lastCol.id, 0);

    const reordered = useTaskStore.getState().columns;
    expect(reordered[0].id).toBe(lastCol.id);
  });
});

describe('persist', () => {
  beforeEach(() => {
    tasksStore.clear();
    settingsStore.clear();
    vi.clearAllMocks();
  });

  it('addTask calls db.tasks.put', async () => {
    const { useTaskStore } = await import('../lib/stores/task-store');
    useTaskStore.setState({ tasks: [], columns: [], initialized: false, activeView: 'editor' });
    await useTaskStore.getState().initialize();
    vi.clearAllMocks();

    await useTaskStore.getState().addTask('Persist me');
    expect(db.tasks.put).toHaveBeenCalled();
  });

  it('column changes call db.settings.put with kanban-columns key', async () => {
    const { useTaskStore } = await import('../lib/stores/task-store');
    useTaskStore.setState({ tasks: [], columns: [], initialized: false, activeView: 'editor' });
    await useTaskStore.getState().initialize();
    vi.clearAllMocks();

    await useTaskStore.getState().addColumn('New Column');
    expect(db.settings.put).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'kanban-columns' })
    );
  });
});

describe('reorder', () => {
  beforeEach(() => {
    tasksStore.clear();
    settingsStore.clear();
    vi.clearAllMocks();
  });

  it('reorderTask within same column', async () => {
    const { useTaskStore } = await import('../lib/stores/task-store');
    useTaskStore.setState({ tasks: [], columns: [], initialized: false, activeView: 'editor' });
    await useTaskStore.getState().initialize();

    const task1 = await useTaskStore.getState().addTask('First');
    const task2 = await useTaskStore.getState().addTask('Second');
    const firstColId = useTaskStore.getState().columns[0].id;

    // Move task2 to position 0 within same column
    await useTaskStore.getState().reorderTask(task2.id, firstColId, 0);

    const tasks = useTaskStore.getState().tasks
      .filter(t => t.columnId === firstColId)
      .sort((a, b) => a.order - b.order);
    expect(tasks[0].id).toBe(task2.id);
  });

  it('reorderTask across columns', async () => {
    const { useTaskStore } = await import('../lib/stores/task-store');
    useTaskStore.setState({ tasks: [], columns: [], initialized: false, activeView: 'editor' });
    await useTaskStore.getState().initialize();

    const task = await useTaskStore.getState().addTask('Move me');
    const secondColId = useTaskStore.getState().columns[1].id;

    await useTaskStore.getState().reorderTask(task.id, secondColId, 0);

    const moved = useTaskStore.getState().tasks.find(t => t.id === task.id);
    expect(moved?.columnId).toBe(secondColId);
  });
});
