import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useUIStore } from '../../lib/stores/ui-store';

export function WhiteboardView() {
  const setActiveView = useUIStore((s) => s.setActiveView);

  // Escape key to go back
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveView('editor');
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [setActiveView]);

  return (
    <div className="w-full h-screen bg-bg flex flex-col">
      {/* Back button */}
      <div className="px-[16px] py-[12px] flex-shrink-0">
        <button
          onClick={() => setActiveView('editor')}
          className="flex items-center gap-[8px] text-text-secondary hover:text-text-primary transition-colors duration-150 rounded-[4px]"
        >
          <ArrowLeft size={20} />
          <span className="text-[14px]">Back to notes</span>
        </button>
      </div>

      {/* Excalidraw embed */}
      <div className="flex-1">
        <iframe
          src="https://excalidraw.com"
          className="w-full h-full border-none"
          title="Whiteboard"
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
}
