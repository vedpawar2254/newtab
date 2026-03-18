import { Plus } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useHabitStore } from '../../lib/stores/habit-store';
import { CollapsibleSection } from './CollapsibleSection';

export function HabitTracker() {
  const habits = useHabitStore((s) => s.habits);
  const addHabit = useHabitStore((s) => s.addHabit);
  const removeHabit = useHabitStore((s) => s.removeHabit);
  const renameHabit = useHabitStore((s) => s.renameHabit);
  const toggleToday = useHabitStore((s) => s.toggleToday);
  const getStreak = useHabitStore((s) => s.getStreak);
  const getLast7Days = useHabitStore((s) => s.getLast7Days);

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    useHabitStore.getState().loadFromStorage();
  }, []);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  // Close context menu on click outside
  useEffect(() => {
    if (!contextMenuId) return;
    const handler = () => setContextMenuId(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [contextMenuId]);

  const handleAddKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const trimmed = newName.trim();
        if (trimmed) {
          addHabit(trimmed);
        }
        setNewName('');
        setIsAdding(false);
      } else if (e.key === 'Escape') {
        setNewName('');
        setIsAdding(false);
      }
    },
    [newName, addHabit],
  );

  const commitEdit = useCallback(() => {
    if (editingId && editName.trim()) {
      renameHabit(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  }, [editingId, editName, renameHabit]);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitEdit();
      } else if (e.key === 'Escape') {
        setEditingId(null);
        setEditName('');
      }
    },
    [commitEdit],
  );

  const handleContextMenu = useCallback(
    (id: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      setContextMenuId(id);
      setContextMenuPos({ x: e.clientX, y: e.clientY });
    },
    [],
  );

  const handleRowKeyDown = useCallback(
    (id: string, name: string) => (e: React.KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (
          confirm(
            `Remove ${name}? This deletes all tracking history.`,
          )
        ) {
          removeHabit(id);
        }
      }
    },
    [removeHabit],
  );

  const todayKey = new Date().toISOString().slice(0, 10);

  return (
    <CollapsibleSection
      id="habits"
      title="HABITS"
      rightAction={
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsAdding(true);
          }}
          className="text-text-secondary hover:text-text-primary transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-[4px]"
          aria-label="Add habit"
        >
          <Plus size={16} />
        </button>
      }
    >
      {habits.length === 0 && !isAdding && (
        <p className="text-[14px] text-text-secondary">
          No habits yet. Tap + to add one.
        </p>
      )}

      {isAdding && (
        <input
          ref={inputRef}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleAddKeyDown}
          className="w-full h-[32px] bg-surface-elevated border border-border text-text-primary text-[14px] px-[8px] rounded-[4px] outline-none focus:border-accent"
          placeholder="Habit name..."
          autoFocus
        />
      )}

      <div className="flex flex-col gap-[2px]">
        {habits.map((habit) => {
          const isCheckedToday = habit.completions[todayKey] === true;
          const streak = getStreak(habit);
          const last7 = getLast7Days(habit);

          return (
            <div
              key={habit.id}
              className="flex items-center h-[32px] gap-[8px] transition-all duration-200 ease-out"
              onContextMenu={handleContextMenu(habit.id)}
              onKeyDown={handleRowKeyDown(habit.id, habit.name)}
              tabIndex={0}
              role="row"
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleToday(habit.id)}
                className={`w-[16px] h-[16px] shrink-0 rounded-[2px] border transition-colors duration-150 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
                  isCheckedToday
                    ? 'bg-habit-complete/20 border-habit-complete'
                    : 'border-border-strong bg-transparent'
                }`}
                aria-label={`Toggle ${habit.name}`}
              >
                {isCheckedToday && (
                  <svg width={10} height={8} viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="#30A46C"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>

              {/* Habit name */}
              {editingId === habit.id ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  onBlur={commitEdit}
                  className="flex-1 h-[24px] bg-surface-elevated border border-border text-text-primary text-[14px] px-[4px] rounded-[4px] outline-none focus:border-accent"
                  autoFocus
                />
              ) : (
                <span className="text-[14px] text-text-primary truncate max-w-[100px]">
                  {habit.name}
                </span>
              )}

              {/* Streak count */}
              <span
                className={`text-[12px] shrink-0 ${
                  streak >= 7 ? 'text-habit-streak' : 'text-text-secondary'
                }`}
              >
                {streak}d
              </span>

              {/* 7-day dots */}
              <div className="flex gap-[4px] shrink-0">
                {last7.map((completed, i) => {
                  const isToday = i === 6;
                  return (
                    <div
                      key={i}
                      className={`w-[8px] h-[8px] rounded-full transition-[fill-opacity] duration-200 ease-out ${
                        completed
                          ? 'bg-habit-complete'
                          : isToday
                            ? 'bg-timer-ring-bg border border-border-strong'
                            : 'bg-habit-incomplete'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Context menu */}
      {contextMenuId && (
        <div
          className="fixed bg-surface-elevated border border-border rounded-[4px] shadow-lg py-[4px] z-50"
          style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
        >
          <button
            onClick={() => {
              setEditingId(contextMenuId);
              setEditName(
                habits.find((h) => h.id === contextMenuId)?.name ?? '',
              );
              setContextMenuId(null);
            }}
            className="w-full text-left px-[12px] py-[6px] text-[14px] text-text-primary hover:bg-white/5 transition-colors duration-150"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (
                confirm(
                  `Remove ${habits.find((h) => h.id === contextMenuId)?.name}? This deletes all tracking history.`,
                )
              ) {
                removeHabit(contextMenuId);
              }
              setContextMenuId(null);
            }}
            className="w-full text-left px-[12px] py-[6px] text-[14px] text-destructive hover:bg-white/5 transition-colors duration-150"
          >
            Remove
          </button>
        </div>
      )}
    </CollapsibleSection>
  );
}
