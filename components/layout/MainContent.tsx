import { FileText } from 'lucide-react';
import { useUIStore } from '../../lib/stores/ui-store';
import { KanbanBoard } from '../kanban/KanbanBoard';

interface MainContentProps {
  children?: React.ReactNode;
  editor?: React.ReactNode;
}

export function MainContent({ children, editor }: MainContentProps) {
  const isLoading = useUIStore((s) => s.isLoading);
  const activeNoteId = useUIStore((s) => s.activeNoteId);
  const activeView = useUIStore((s) => s.activeView);

  return (
    <main
      data-region="editor"
      className={`flex-1 bg-bg min-h-screen ${
        activeView === 'kanban' ? '' : 'pt-[48px] px-[32px]'
      }`}
    >
      <div className={activeView === 'kanban' ? 'h-full' : 'max-w-[720px] mx-auto'}>
        {isLoading ? (
          children
        ) : activeView === 'kanban' ? (
          <KanbanBoard />
        ) : activeNoteId && editor ? (
          <div key={activeNoteId} className="page-enter">
            {editor}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-[16px] min-h-[60vh]">
            <FileText
              size={48}
              style={{ color: 'rgba(255, 255, 255, 0.15)' }}
            />
            <h1 className="text-[20px] font-semibold text-text-primary tracking-[-0.01em]">
              Start writing
            </h1>
            <p className="text-[14px] text-text-secondary text-center">
              Create your first page to begin. Your notes stay on this device,
              always private.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
