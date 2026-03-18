import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import { KanbanColumnHeader } from './KanbanColumnHeader';
import { AddCardButton } from './AddCardButton';
import type { KanbanColumn as KanbanColumnType } from '../../lib/storage/types';
import type { TaskRecord } from '../../lib/storage/types';

interface KanbanColumnProps {
  column: KanbanColumnType;
  tasks: TaskRecord[];
}

export function KanbanColumn({ column, tasks }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`w-[280px] flex-shrink-0 flex flex-col bg-surface border border-border rounded-[8px] transition-colors duration-[200ms] ${
        isOver ? 'bg-[rgba(91,155,213,0.04)]' : ''
      }`}
      style={{ maxHeight: 'calc(100vh - 120px)' }}
    >
      <KanbanColumnHeader column={column} taskCount={tasks.length} />

      <div className="flex-1 overflow-y-auto p-[8px] flex flex-col gap-[8px]">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length > 0 ? (
            tasks.map((task) => <KanbanCard key={task.id} task={task} />)
          ) : (
            <div className="flex items-center justify-center py-[16px]">
              <span className="text-[12px] text-text-secondary">No cards</span>
            </div>
          )}
        </SortableContext>
      </div>

      <AddCardButton columnId={column.id} taskCount={tasks.length} />
    </div>
  );
}
