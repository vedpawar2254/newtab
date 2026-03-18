import { useState, useRef, useEffect } from 'react';
import { useTaskStore } from '../../lib/stores/task-store';

export function AddColumnButton() {
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

    await useTaskStore.getState().addColumn(trimmed);
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
      <div className="w-[280px] flex-shrink-0">
        <div className="bg-[rgba(255,255,255,0.04)] border border-dashed border-[rgba(255,255,255,0.12)] rounded-[8px] px-[16px] py-[8px]">
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSubmit}
            placeholder="Column name"
            className="w-full bg-transparent text-[14px] font-normal text-text-primary placeholder:text-text-secondary outline-none"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-[280px] flex-shrink-0">
      <button
        onClick={() => setIsAdding(true)}
        className="w-full h-[40px] flex items-center justify-center bg-[rgba(255,255,255,0.04)] border border-dashed border-[rgba(255,255,255,0.12)] rounded-[8px] text-[14px] text-text-secondary hover:text-accent hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.20)] transition-colors duration-[150ms]"
      >
        + Add column
      </button>
    </div>
  );
}
