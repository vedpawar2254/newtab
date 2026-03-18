import { Columns3 } from 'lucide-react';
import { useUIStore } from '../../lib/stores/ui-store';
import { NewPageButton } from '../sidebar/NewPageButton';
import { PageTree } from '../sidebar/PageTree';
import { SidebarToggle } from './SidebarToggle';
import { PomodoroTimer } from '../widgets/PomodoroTimer';
import { HabitTracker } from '../widgets/HabitTracker';
import { JournalSection } from '../widgets/JournalSection';
import { WhiteboardButton } from '../widgets/WhiteboardButton';
import { QuoteFooter } from '../widgets/QuoteFooter';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

export function Sidebar({ isOpen, onToggle, children }: SidebarProps) {
  const isLoading = useUIStore((s) => s.isLoading);
  const activeView = useUIStore((s) => s.activeView);

  return (
    <aside
      data-region="sidebar"
      className={`fixed left-0 top-0 w-[240px] h-screen bg-surface border-r border-border flex flex-col transition-transform duration-[250ms] ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-[16px] py-[16px]">
        <span className="text-[14px] font-semibold text-text-primary tracking-[-0.01em]">
          NewTab
        </span>
        <SidebarToggle isOpen={isOpen} onToggle={onToggle} />
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Navigation */}
        <nav className="px-[8px]">
          {isLoading ? (
            children
          ) : (
            <>
              <NewPageButton />
              <PageTree />
            </>
          )}
        </nav>

        {/* Widget sections (below page tree) */}
        {!isLoading && (
          <div className="mt-[24px] flex flex-col">
            <PomodoroTimer />
            <HabitTracker />
            <JournalSection />
            <div className="border-t border-border px-[8px] py-[4px]">
              <WhiteboardButton />
            </div>
            <div className="border-t border-border px-[8px] py-[4px]">
              <button
                onClick={() => {
                  useUIStore.getState().setActiveView('kanban');
                  useUIStore.getState().setActiveNote(null);
                }}
                className={`flex items-center gap-[8px] w-full px-[8px] py-[6px] rounded-[4px] text-[14px] transition-colors duration-[150ms] ${
                  activeView === 'kanban'
                    ? 'text-accent bg-active-item-bg'
                    : 'text-text-secondary hover:bg-surface-elevated'
                }`}
              >
                <Columns3 size={16} />
                Kanban Board
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quote footer - pinned to bottom, outside scrollable area */}
      {!isLoading && <QuoteFooter />}
    </aside>
  );
}
