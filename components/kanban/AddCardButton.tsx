import { useState, useRef, useEffect } from 'react';
import { useTaskStore } from '../../lib/stores/task-store';

interface AddCardButtonProps {
  columnId: string;
  taskCount: number;
}

export function AddCardButton({ columnId, taskCount }: AddCardButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  async function handleSubmit() {
    const trimmed = title.trim();
    if (!trimmed) {
      setIsAdding(false);
      setTitle('');
      return;
    }

    const store = useTaskStore.getState();
    const firstColumnId = store.getFirstColumnId();
    const newTask = await store.addTask(trimmed);

    // If not the first column, move the task to this column
    if (firstColumnId && columnId !== firstColumnId) {
      await store.reorderTask(newTask.id, columnId, taskCount);
    }

    setTitle('');
    setIsAdding(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setTitle('');
      setIsAdding(false);
    }
  }

  if (isAdding) {
    return (
      <div className="px-[8px] pb-[8px]">
        <div className="bg-surface-elevated border border-border rounded-[6px] px-[16px] py-[8px] min-h-[40px]">
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSubmit}
            placeholder="Card title..."
            className="w-full bg-transparent text-[14px] font-normal text-text-primary placeholder:text-text-secondary outline-none"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="px-[8px] pb-[8px]">
      <button
        onClick={() => setIsAdding(true)}
        className="w-full text-left px-[16px] py-[8px] text-[12px] text-text-secondary hover:text-accent hover:bg-[rgba(255,255,255,0.04)] rounded-[4px] transition-colors duration-[150ms]"
      >
        + Add card
      </button>
    </div>
  );
}
