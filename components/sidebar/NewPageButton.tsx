import { Plus } from 'lucide-react';
import { useNotesStore } from '../../lib/stores/notes-store';
import { useUIStore } from '../../lib/stores/ui-store';

export function NewPageButton() {
  const createNote = useNotesStore((s) => s.createNote);
  const setActiveNote = useUIStore((s) => s.setActiveNote);
  const setRenamingId = useUIStore((s) => s.setRenamingId);

  const handleClick = async () => {
    const note = await createNote('Untitled', null);
    setActiveNote(note.id);
    setRenamingId(note.id);
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Create new page"
      className="flex items-center gap-[8px] h-[32px] px-[8px] w-full rounded text-accent text-[12px] font-normal uppercase tracking-[0.05em] hover:bg-surface-elevated transition-colors duration-150"
    >
      <Plus size={14} />
      <span>New Page</span>
    </button>
  );
}
