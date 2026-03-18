import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useTaskStore } from '../../lib/stores/task-store';
import type { KanbanColumn } from '../../lib/storage/types';

interface KanbanColumnHeaderProps {
  column: KanbanColumn;
  taskCount: number;
}

export function KanbanColumnHeader({ column, taskCount }: KanbanColumnHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (!showMenu) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  function handleSave() {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== column.title) {
      useTaskStore.getState().renameColumn(column.id, trimmed);
    }
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditTitle(column.title);
      setIsEditing(false);
    }
  }

  function handleDelete() {
    setShowMenu(false);
    const confirmed = window.confirm(
      `Delete "${column.title}"? All cards will be moved to the first column.`
    );
    if (confirmed) {
      useTaskStore.getState().deleteColumn(column.id);
    }
  }

  function handleRename() {
    setShowMenu(false);
    setEditTitle(column.title);
    setIsEditing(true);
  }

  return (
    <div
      className="flex items-center justify-between px-[16px] py-[8px] border-b border-border"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-[8px] flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="bg-transparent text-[12px] uppercase font-normal tracking-[0.05em] text-text-primary outline-none w-full"
          />
        ) : (
          <span
            className="text-[12px] uppercase font-normal tracking-[0.05em] text-text-primary truncate"
            onDoubleClick={() => {
              setEditTitle(column.title);
              setIsEditing(true);
            }}
          >
            {column.title}
          </span>
        )}
        <span className="text-[12px] text-text-secondary flex-shrink-0">
          {taskCount}
        </span>
      </div>

      <div className="relative flex-shrink-0" ref={menuRef}>
        {isHovered && !isEditing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
            className="p-[2px] rounded-[2px] text-text-secondary hover:text-text-primary transition-colors duration-[150ms]"
            aria-label="Column options"
          >
            <MoreHorizontal size={14} />
          </button>
        )}

        {showMenu && (
          <div className="absolute right-0 top-full mt-[4px] w-[140px] bg-surface-elevated border border-border rounded-[6px] shadow-lg z-50 py-[4px]">
            <button
              onClick={handleRename}
              className="w-full text-left px-[12px] py-[6px] text-[13px] text-text-primary hover:bg-[rgba(255,255,255,0.04)] transition-colors"
            >
              Rename
            </button>
            <button
              onClick={handleDelete}
              className="w-full text-left px-[12px] py-[6px] text-[13px] text-[#E5484D] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
