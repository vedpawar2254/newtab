import { PanelLeftClose, PanelLeft } from 'lucide-react';

interface SidebarToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function SidebarToggle({ isOpen, onToggle }: SidebarToggleProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      className="flex items-center justify-center w-[28px] h-[28px] rounded bg-transparent hover:bg-surface-elevated transition-colors duration-150 group"
    >
      {isOpen ? (
        <PanelLeftClose
          size={16}
          className="text-text-secondary group-hover:text-accent transition-colors duration-150"
        />
      ) : (
        <PanelLeft
          size={16}
          className="text-text-secondary group-hover:text-accent transition-colors duration-150"
        />
      )}
    </button>
  );
}
