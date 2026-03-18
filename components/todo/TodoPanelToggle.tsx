import { CheckSquare } from 'lucide-react';

interface TodoPanelToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function TodoPanelToggle({ isOpen, onToggle }: TodoPanelToggleProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={isOpen ? 'Close todo panel' : 'Open todo panel'}
      className={`w-[28px] h-[28px] flex items-center justify-center rounded-[4px] transition-colors hover:bg-surface-elevated ${
        isOpen ? 'text-accent' : 'text-text-secondary'
      }`}
    >
      <CheckSquare size={16} />
    </button>
  );
}
