import { useState, useRef, useEffect, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import type { TaskRecord } from '../../lib/storage/types';

interface TodoItemProps {
  task: TaskRecord;
  isCompleted: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, title: string) => void;
}

export function TodoItem({ task, isCompleted, onToggle, onDelete, onUpdate }: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Only use sortable for incomplete tasks
  const sortable = useSortable({ id: task.id, disabled: isCompleted });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortable;

  const style = isCompleted
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
      };

  const handleToggle = useCallback(() => {
    onToggle(task.id);
  }, [task.id, onToggle]);

  const handleDoubleClick = useCallback(() => {
    if (isCompleted) return;
    setEditing(true);
    setEditValue(task.title);
  }, [task.title, isCompleted]);

  const commitEdit = useCallback(() => {
    setEditing(false);
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== task.title) {
      onUpdate(task.id, trimmed);
    } else {
      setEditValue(task.title);
    }
  }, [editValue, task.id, task.title, onUpdate]);

  const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      commitEdit();
    } else if (e.key === 'Escape') {
      setEditing(false);
      setEditValue(task.title);
    }
  }, [commitEdit, task.title]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  return (
    <div
      ref={isCompleted ? undefined : setNodeRef}
      style={style}
      className={`flex items-center gap-[8px] min-h-[36px] py-[6px] px-[8px] rounded-[4px] group transition-colors ${
        hovered ? 'bg-surface-elevated' : ''
      } ${isCompleted ? 'opacity-50' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        className={`w-[18px] h-[18px] flex-shrink-0 rounded-[4px] border-[2px] flex items-center justify-center transition-colors ${
          isCompleted
            ? 'bg-success border-success'
            : 'border-[rgba(255,255,255,0.25)] hover:border-[rgba(255,255,255,0.40)]'
        }`}
        aria-label={isCompleted ? `Uncheck "${task.title}"` : `Complete "${task.title}"`}
      >
        {isCompleted && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Title */}
      {editing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleEditKeyDown}
          className="flex-1 bg-transparent text-[13px] text-text-primary outline-none border-b border-accent"
          spellCheck={false}
        />
      ) : (
        <span
          className={`flex-1 text-[13px] truncate cursor-default ${
            isCompleted ? 'line-through text-text-secondary' : 'text-text-primary'
          }`}
          onDoubleClick={handleDoubleClick}
          spellCheck={false}
        >
          {task.title}
        </span>
      )}

      {/* Delete button */}
      <button
        onClick={() => onDelete(task.id)}
        className={`w-[20px] h-[20px] flex items-center justify-center text-text-secondary hover:text-destructive transition-opacity flex-shrink-0 ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label={`Delete "${task.title}"`}
        tabIndex={hovered ? 0 : -1}
      >
        <X size={12} />
      </button>

      {/* Drag handle — only for incomplete tasks */}
      {!isCompleted && (
        <button
          {...attributes}
          {...listeners}
          className={`w-[20px] h-[20px] flex items-center justify-center text-text-secondary hover:text-text-primary cursor-grab active:cursor-grabbing flex-shrink-0 transition-opacity ${
            hovered ? 'opacity-100' : 'opacity-0'
          }`}
          aria-label="Drag to reorder"
        >
          <GripVertical size={14} />
        </button>
      )}
    </div>
  );
}
