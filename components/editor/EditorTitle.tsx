import { useCallback, useEffect, useRef } from 'react';

interface EditorTitleProps {
  title: string;
  noteId: string | null;
  onTitleChange: (title: string) => void;
}

export function EditorTitle({ title, noteId, onTitleChange }: EditorTitleProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset input value when note changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = title;
    }
  }, [noteId, title]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const prosemirror = document.querySelector('.ProseMirror');
        if (prosemirror instanceof HTMLElement) {
          prosemirror.focus();
        }
      }
    },
    [],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onTitleChange(e.target.value);
    },
    [onTitleChange],
  );

  return (
    <input
      ref={inputRef}
      type="text"
      defaultValue={title}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder="Untitled"
      aria-label="Note title"
      className="w-full bg-transparent border-none outline-none mb-[16px]"
      style={{
        fontSize: '28px',
        fontWeight: 600,
        color: '#ECECEC',
        fontFamily: 'var(--font-mono)',
      }}
    />
  );
}
