import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import type { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Columns3 } from 'lucide-react';
import { useTaskStore } from '../../lib/stores/task-store';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { AddColumnButton } from './AddColumnButton';

export function KanbanBoard() {
  const tasks = useTaskStore((s) => s.tasks);
  const columns = useTaskStore((s) => s.columns);
  const initialized = useTaskStore((s) => s.initialized);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (!initialized) {
      useTaskStore.getState().initialize();
    }
  }, [initialized]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedColumns = useMemo(
    () => [...columns].sort((a, b) => a.order - b.order),
    [columns]
  );

  const tasksByColumn = useMemo(() => {
    const map: Record<string, typeof tasks> = {};
    for (const col of columns) {
      map[col.id] = tasks
        .filter((t) => t.columnId === col.id)
        .sort((a, b) => a.order - b.order);
    }
    return map;
  }, [tasks, columns]);

  const activeTask = useMemo(
    () => (activeTaskId ? tasks.find((t) => t.id === activeTaskId) : null),
    [activeTaskId, tasks]
  );

  const findColumnForTask = useCallback(
    (taskId: string): string | undefined => {
      const task = tasks.find((t) => t.id === taskId);
      return task?.columnId;
    },
    [tasks]
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveTaskId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumnForTask(activeId);
    const overColumn = findColumnForTask(overId) ?? overId;

    if (!activeColumn || !overColumn || activeColumn === overColumn) return;

    // Check if overColumn is a valid column ID
    const isValidColumn = columns.some((c) => c.id === overColumn);
    if (!isValidColumn) return;

    const overTasks = tasks
      .filter((t) => t.columnId === overColumn && t.id !== activeId)
      .sort((a, b) => a.order - b.order);
    const overIndex = overTasks.findIndex((t) => t.id === overId);
    const newIndex = overIndex >= 0 ? overIndex : overTasks.length;

    useTaskStore.getState().reorderTask(activeId, overColumn, newIndex);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTaskId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeColumn = findColumnForTask(activeId);
    const overColumn = findColumnForTask(overId) ?? overId;

    if (activeColumn === overColumn && activeColumn) {
      const columnTasks = tasks
        .filter((t) => t.columnId === activeColumn)
        .sort((a, b) => a.order - b.order);
      const oldIndex = columnTasks.findIndex((t) => t.id === activeId);
      const newIndex = columnTasks.findIndex((t) => t.id === overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        useTaskStore.getState().reorderTask(activeId, activeColumn, newIndex);
      }
    }
  }

  if (!initialized) {
    return null;
  }

  if (columns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-[16px] min-h-[60vh]">
        <Columns3 size={48} style={{ color: 'rgba(255, 255, 255, 0.15)' }} />
        <h1 className="text-[20px] font-semibold text-text-primary">
          Your board is empty
        </h1>
        <p className="text-[14px] text-text-secondary text-center">
          Add a card to any column, or create a new column to get started.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-[16px] overflow-x-auto h-full p-[24px] pt-[32px]">
        {sortedColumns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasksByColumn[column.id] || []}
          />
        ))}
        <AddColumnButton />
      </div>
      <DragOverlay>
        {activeTask ? <KanbanCard task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
