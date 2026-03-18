import { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CheckCircle2, Trash2 } from 'lucide-react';
import { useTaskStore } from '../../lib/stores/task-store';
import { TodoItem } from './TodoItem';
import { TodoInput } from './TodoInput';
import type { TaskRecord } from '../../lib/storage/types';

interface TodoPanelProps {
  isOpen: boolean;
}

export function TodoPanel({ isOpen }: TodoPanelProps) {
  const tasks = useTaskStore((s) => s.tasks);
  const completeTask = useTaskStore((s) => s.completeTask);
  const uncompleteTask = useTaskStore((s) => s.uncompleteTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const reorderTask = useTaskStore((s) => s.reorderTask);
  const getDoneColumnId = useTaskStore((s) => s.getDoneColumnId);

  const [activeId, setActiveId] = useState<string | null>(null);

  const doneColumnId = getDoneColumnId();

  // Show ALL tasks — incomplete first, then completed
  const incompleteTasks = useMemo(() => {
    return tasks
      .filter((t) => t.columnId !== doneColumnId)
      .sort((a, b) => a.order - b.order);
  }, [tasks, doneColumnId]);

  const completedTasks = useMemo(() => {
    return tasks
      .filter((t) => t.columnId === doneColumnId)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [tasks, doneColumnId]);

  const allDisplayTasks = useMemo(
    () => [...incompleteTasks, ...completedTasks],
    [incompleteTasks, completedTasks]
  );

  const activeTask = useMemo(() => {
    if (!activeId) return null;
    return incompleteTasks.find((t) => t.id === activeId) ?? null;
  }, [activeId, incompleteTasks]);

  const incompleteIds = useMemo(() => incompleteTasks.map((t) => t.id), [incompleteTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = incompleteTasks.findIndex((t) => t.id === active.id);
      const newIndex = incompleteTasks.findIndex((t) => t.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const task = incompleteTasks[oldIndex];
      reorderTask(task.id, task.columnId, newIndex);
    },
    [incompleteTasks, reorderTask]
  );

  const handleToggle = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      if (task.columnId === doneColumnId) {
        uncompleteTask(id);
      } else {
        completeTask(id);
      }
    },
    [tasks, doneColumnId, completeTask, uncompleteTask]
  );

  const handleUpdate = useCallback(
    (id: string, title: string) => {
      updateTask(id, { title });
    },
    [updateTask]
  );

  const handleClearCompleted = useCallback(() => {
    completedTasks.forEach((t) => deleteTask(t.id));
  }, [completedTasks, deleteTask]);

  return (
    <aside
      data-region="panels"
      className={`fixed right-0 top-0 w-[280px] h-screen bg-surface border-l border-border flex flex-col transition-transform duration-[250ms] ease-in-out z-30 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="h-[44px] flex items-center justify-between px-[16px] border-b border-border flex-shrink-0">
        <span className="text-[12px] font-normal uppercase tracking-[0.05em] text-text-secondary">
          TODOS
        </span>
        {completedTasks.length > 0 && (
          <button
            onClick={handleClearCompleted}
            className="flex items-center gap-[4px] text-[11px] text-text-secondary hover:text-destructive transition-colors"
            aria-label="Clear completed todos"
          >
            <Trash2 size={12} />
            Clear done ({completedTasks.length})
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-[8px] py-[8px]">
        {allDisplayTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-[8px] text-center px-[16px]">
            <CheckCircle2 size={32} className="text-[rgba(255,255,255,0.15)]" />
            <span className="text-[13px] text-text-primary font-medium">
              No todos yet
            </span>
            <span className="text-[12px] text-text-secondary">
              Type below to add your first task.
            </span>
          </div>
        ) : (
          <>
            {/* Incomplete tasks — draggable */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={incompleteIds}
                strategy={verticalListSortingStrategy}
              >
                {incompleteTasks.map((task) => (
                  <TodoItem
                    key={task.id}
                    task={task}
                    isCompleted={false}
                    onToggle={handleToggle}
                    onDelete={deleteTask}
                    onUpdate={handleUpdate}
                  />
                ))}
              </SortableContext>
              <DragOverlay>
                {activeTask ? (
                  <TodoItemOverlay task={activeTask} />
                ) : null}
              </DragOverlay>
            </DndContext>

            {/* Completed tasks — not draggable, shown below with separator */}
            {completedTasks.length > 0 && (
              <>
                {incompleteTasks.length > 0 && (
                  <div className="border-t border-border my-[8px]" />
                )}
                {completedTasks.map((task) => (
                  <TodoItem
                    key={task.id}
                    task={task}
                    isCompleted={true}
                    onToggle={handleToggle}
                    onDelete={deleteTask}
                    onUpdate={handleUpdate}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <TodoInput />
    </aside>
  );
}

function TodoItemOverlay({ task }: { task: TaskRecord }) {
  return (
    <div className="flex items-center gap-[8px] min-h-[36px] py-[8px] px-[8px] rounded-[4px] bg-surface-elevated shadow-lg">
      <div className="w-[18px] h-[18px] flex-shrink-0 rounded-[4px] border-[2px] border-[rgba(255,255,255,0.25)]" />
      <span className="flex-1 text-[13px] text-text-primary truncate">
        {task.title}
      </span>
    </div>
  );
}
