import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X } from 'lucide-react';
import { useTaskStore } from '../../lib/stores/task-store';
import type { TaskRecord } from '../../lib/storage/types';

interface KanbanCardProps {
  task: TaskRecord;
  isOverlay?: boolean;
}

export function KanbanCard({ task, isOverlay }: KanbanCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style: React.CSSProperties = isOverlay
    ? {
        opacity: 0.6,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        transform: 'rotate(2deg)',
      }
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
      };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  function handleSave() {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== task.title) {
      useTaskStore.getState().updateTask(task.id, { title: trimmed });
    }
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditTitle(task.title);
      setIsEditing(false);
    }
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    useTaskStore.getState().deleteTask(task.id);
  }

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      {...(isOverlay ? {} : attributes)}
      {...(isOverlay ? {} : listeners)}
      className={`relative bg-surface-elevated border border-border rounded-[6px] px-[16px] py-[8px] min-h-[40px] flex items-center ${
        isOverlay ? '' : 'cursor-grab hover:border-[rgba(255,255,255,0.15)]'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (!isDragging && !isEditing) {
          setEditTitle(task.title);
          setIsEditing(true);
        }
      }}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="w-full bg-transparent text-[14px] font-normal text-text-primary outline-none"
        />
      ) : (
        <span className="text-[14px] font-normal text-text-primary truncate flex-1">
          {task.title}
        </span>
      )}

      {isHovered && !isEditing && !isDragging && (
        <button
          onClick={handleDelete}
          className="absolute right-[8px] top-1/2 -translate-y-1/2 p-[2px] rounded-[2px] text-text-secondary hover:text-text-primary transition-colors duration-[150ms]"
          aria-label="Delete card"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
