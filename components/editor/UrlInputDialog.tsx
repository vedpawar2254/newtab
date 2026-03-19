import { useState, useRef, useEffect } from 'react';

interface UrlInputDialogProps {
  isOpen: boolean;
  label: string;
  placeholder?: string;
  onSubmit: (url: string) => void;
  onCancel: () => void;
}

export function UrlInputDialog({ isOpen, label, placeholder, onSubmit, onCancel }: UrlInputDialogProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue('');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleSubmit() {
    const trimmed = value.trim();
    if (trimmed) {
      onSubmit(trimmed);
    }
    setValue('');
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-backdrop" onClick={onCancel}>
      <div
        className="bg-surface border border-border-strong rounded-[8px] p-[16px] w-[400px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-[fadeScaleIn_150ms_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[14px] text-text-primary mb-[12px]">{label}</p>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
            if (e.key === 'Escape') onCancel();
          }}
          placeholder={placeholder || 'https://...'}
          className="w-full bg-surface-elevated border border-border rounded-[6px] px-[12px] py-[8px] text-[14px] text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-accent"
        />
        <div className="flex justify-end gap-[8px] mt-[12px]">
          <button
            type="button"
            onClick={onCancel}
            className="px-[12px] py-[6px] text-[13px] rounded-[4px] text-text-secondary hover:bg-surface-elevated transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-[12px] py-[6px] text-[13px] rounded-[4px] bg-accent text-white hover:bg-accent/90 transition-colors duration-150"
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
}
