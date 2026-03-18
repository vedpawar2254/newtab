import { useState, useRef, useEffect, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import type { TaskRecord } from '../../lib/storage/types';

interface TodoItemProps {
  task: TaskRecord;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, title: string) => void;
}

export function TodoItem({ task, onComplete, onDelete, onUpdate }: TodoItemProps) {
  const [checked, setChecked] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  const handleCheck = useCallback(() => {
    setChecked(true);
    setTimeout(() => {
      onComplete(task.id);
    }, 2000);
  }, [task.id, onComplete]);

  const handleDoubleClick = useCallback(() => {
    setEditing(true);
    setEditValue(task.title);
  }, [task.title]);

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
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-[8px] min-h-[36px] py-[8px] px-[8px] rounded-[4px] group transition-colors ${
        hovered ? 'bg-surface-elevated' : ''
      } ${checked ? 'line-through opacity-50' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Checkbox */}
      <button
        onClick={handleCheck}
        disabled={checked}
        className={`w-[18px] h-[18px] flex-shrink-0 rounded-[4px] border-[2px] flex items-center justify-center transition-colors ${
          checked
            ? 'bg-success border-success'
            : 'border-[rgba(255,255,255,0.25)] hover:border-[rgba(255,255,255,0.40)]'
        }`}
        aria-label={`Mark "${task.title}" as complete`}
      >
        {checked && (
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
        />
      ) : (
        <span
          className={`flex-1 text-[13px] text-text-primary truncate cursor-default ${
            checked ? 'line-through opacity-50' : ''
          }`}
          onDoubleClick={handleDoubleClick}
        >
          {task.title}
        </span>
      )}

      {/* Delete button */}
      {hovered && !checked && (
        <button
          onClick={() => onDelete(task.id)}
          className="w-[20px] h-[20px] flex items-center justify-center text-text-secondary hover:text-destructive transition-colors flex-shrink-0"
          aria-label={`Delete "${task.title}"`}
        >
          <X size={12} />
        </button>
      )}

      {/* Drag handle */}
      {hovered && !checked && (
        <button
          {...attributes}
          {...listeners}
          className="w-[20px] h-[20px] flex items-center justify-center text-text-secondary hover:text-text-primary cursor-grab active:cursor-grabbing flex-shrink-0"
          aria-label="Drag to reorder"
        >
          <GripVertical size={14} />
        </button>
      )}
    </div>
  );
}
