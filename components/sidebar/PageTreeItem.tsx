import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronRight, GripVertical, Plus } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNotesStore } from '../../lib/stores/notes-store';
import { useUIStore } from '../../lib/stores/ui-store';
import { MoreMenu } from './MoreMenu';

interface PageTreeItemProps {
  id: string;
  title: string;
  depth: number;
  childCount: number;
  isActive: boolean;
  isCollapsed: boolean;
  isRenaming: boolean;
}

export function PageTreeItem({
  id,
  title,
  depth,
  childCount,
  isActive,
  isCollapsed,
  isRenaming,
}: PageTreeItemProps) {
  const setActiveNote = useUIStore((s) => s.setActiveNote);
  const setActiveView = useUIStore((s) => s.setActiveView);
  const toggleCollapsed = useUIStore((s) => s.toggleCollapsed);
  const setRenamingId = useUIStore((s) => s.setRenamingId);
  const renameNote = useNotesStore((s) => s.renameNote);
  const createNote = useNotesStore((s) => s.createNote);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [renameValue, setRenameValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    setRenameValue(title);
  }, [title]);

  const confirmRename = useCallback(() => {
    const trimmed = renameValue.trim() || 'Untitled';
    renameNote(id, trimmed);
    setRenamingId(null);
    rowRef.current?.focus();
  }, [id, renameValue, renameNote, setRenamingId]);

  const cancelRename = useCallback(() => {
    setRenameValue(title);
    setRenamingId(null);
  }, [title, setRenamingId]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        confirmRename();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelRename();
      }
    },
    [confirmRename, cancelRename],
  );

  const handleRowClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('button') ||
        target.closest('input') ||
        target.tagName === 'INPUT'
      ) {
        return;
      }
      setActiveNote(id);
      setActiveView('editor');
    },
    [id, setActiveNote, setActiveView],
  );

  const handleChevronClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleCollapsed(id);
    },
    [id, toggleCollapsed],
  );

  const handleAddChild = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      const note = await createNote('Untitled', id);
      setActiveNote(note.id);
      setActiveView('editor');
      setRenamingId(note.id);
      if (isCollapsed) {
        toggleCollapsed(id);
      }
    },
    [id, createNote, setActiveNote, setActiveView, setRenamingId, isCollapsed, toggleCollapsed],
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setRenamingId(id);
    },
    [id, setRenamingId],
  );

  const hasChildren = childCount > 0;
  const isExpanded = hasChildren && !isCollapsed;

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        (rowRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      role="treeitem"
      tabIndex={0}
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isActive}
      onClick={handleRowClick}
      style={{
        ...style,
        paddingLeft: `${depth * 16}px`,
        backgroundColor: isActive
          ? 'var(--color-active-item-bg)'
          : undefined,
        opacity: isDragging ? 0.3 : 1,
      }}
      className={`group flex items-center h-[32px] w-full cursor-pointer select-none transition-colors duration-150 ${
        isActive
          ? 'border-l-2 border-active-item-border'
          : 'border-l-2 border-transparent hover:bg-surface-elevated'
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 w-[20px] flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-[3px] transition-opacity duration-150"
        tabIndex={-1}
      >
        <GripVertical size={14} className="text-[rgba(255,255,255,0.30)]" />
      </button>

      {/* Chevron */}
      <button
        onClick={hasChildren ? handleChevronClick : undefined}
        className="flex-shrink-0 w-[20px] h-[20px] flex items-center justify-center"
        tabIndex={-1}
        aria-label={hasChildren ? (isExpanded ? 'Collapse' : 'Expand') : undefined}
      >
        {hasChildren && (
          <ChevronRight
            size={14}
            className={`text-white/40 transition-transform duration-150 ease-in-out ${
              isExpanded ? 'rotate-90' : ''
            }`}
          />
        )}
      </button>

      {/* Page name or rename input */}
      <div className="flex-1 min-w-0 px-[4px]">
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={confirmRename}
            className="w-full bg-transparent text-[14px] font-normal text-text-primary outline-none border-none focus:ring-2 focus:ring-accent rounded-[2px] px-[2px]"
          />
        ) : (
          <span
            onDoubleClick={handleDoubleClick}
            className="block text-[14px] font-normal text-text-primary truncate"
          >
            {title}
          </span>
        )}
      </div>

      {/* Hover actions */}
      <div className="flex-shrink-0 flex items-center gap-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-150 pr-[4px]">
        <button
          onClick={handleAddChild}
          aria-label="Create child page"
          className="w-[20px] h-[20px] flex items-center justify-center rounded hover:bg-white/10"
          tabIndex={-1}
        >
          <Plus size={14} className="text-accent" />
        </button>
        <MoreMenu pageId={id} childCount={childCount} />
      </div>
    </div>
  );
}
