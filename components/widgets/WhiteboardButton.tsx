import { PenTool, ChevronRight } from 'lucide-react';
import { useUIStore } from '../../lib/stores/ui-store';

export function WhiteboardButton() {
  const setActiveView = useUIStore((s) => s.setActiveView);

  return (
    <button
      onClick={() => setActiveView('whiteboard')}
      className="w-full h-[36px] flex items-center gap-[8px] px-[16px] text-left hover:bg-surface-elevated transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-[4px]"
    >
      <PenTool size={16} className="text-text-secondary shrink-0" />
      <span className="text-[14px] font-normal text-text-primary flex-1">Whiteboard</span>
      <ChevronRight size={14} className="text-text-secondary shrink-0" />
    </button>
  );
}
