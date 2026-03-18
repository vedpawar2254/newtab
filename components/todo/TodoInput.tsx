import { useState, useCallback } from 'react';
import { useTaskStore } from '../../lib/stores/task-store';

export function TodoInput() {
  const [value, setValue] = useState('');
  const addTask = useTaskStore((s) => s.addTask);

  const handleSubmit = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    await addTask(trimmed);
    setValue('');
  }, [value, addTask]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="sticky bottom-0 p-[12px] bg-bg border-t border-border">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add a todo..."
        className="w-full bg-bg border border-border rounded-[6px] px-[16px] py-[8px] text-[13px] text-text-primary placeholder:text-[rgba(255,255,255,0.30)] outline-none focus:border-accent focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg font-mono"
      />
    </div>
  );
}
