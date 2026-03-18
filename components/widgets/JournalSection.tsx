import { useEffect } from 'react';
import { useJournalStore } from '../../lib/stores/journal-store';
import { useUIStore } from '../../lib/stores/ui-store';
import { CollapsibleSection } from './CollapsibleSection';

export function JournalSection() {
  const recentEntries = useJournalStore((s) => s.recentEntries);
  const hasTodayEntry = useJournalStore((s) => s.hasTodayEntry);
  const createTodayEntry = useJournalStore((s) => s.createTodayEntry);
  const activeNoteId = useUIStore((s) => s.activeNoteId);

  useEffect(() => {
    useJournalStore.getState().loadRecentEntries();
  }, []);

  const handleCreateToday = async () => {
    const noteId = await createTodayEntry();
    useUIStore.getState().setActiveView('editor');
    useUIStore.getState().setActiveNote(noteId);
  };

  const showCta = !hasTodayEntry();
  const showEmpty = recentEntries.length === 0 && !hasTodayEntry();

  return (
    <CollapsibleSection id="journal" title="JOURNAL">
      {showCta && (
        <button
          type="button"
          onClick={handleCreateToday}
          className="w-full h-[36px] bg-transparent border border-accent/20 rounded-[4px] text-[14px] font-normal text-accent hover:bg-accent/[0.08] transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          Start today's journal
        </button>
      )}

      {showEmpty ? (
        <p className="text-[14px] text-text-secondary">
          No journal entries yet. Start writing today.
        </p>
      ) : (
        <div className="flex flex-col">
          {recentEntries.map((entry) => {
            const isActive = entry.id === activeNoteId;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => {
                  useUIStore.getState().setActiveView('editor');
                  useUIStore.getState().setActiveNote(entry.id);
                }}
                className={`w-full text-left h-[32px] px-[8px] flex items-center text-[14px] font-normal rounded-[4px] transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
                  isActive
                    ? 'text-accent bg-accent/[0.08]'
                    : 'text-text-primary hover:bg-surface-elevated'
                }`}
              >
                {entry.title}
              </button>
            );
          })}
        </div>
      )}
    </CollapsibleSection>
  );
}
