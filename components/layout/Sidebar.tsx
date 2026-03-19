import { useCallback, useRef } from 'react';
import { Columns3 } from 'lucide-react';
import { useUIStore } from '../../lib/stores/ui-store';
import { NewPageButton } from '../sidebar/NewPageButton';
import { PageTree } from '../sidebar/PageTree';
import { SearchBar } from '../sidebar/SearchBar';
import { SidebarToggle } from './SidebarToggle';
import { SidebarWidgetSettings } from '../sidebar/SidebarWidgetSettings';
import { PomodoroTimer } from '../widgets/PomodoroTimer';
import { HabitTracker } from '../widgets/HabitTracker';
import { JournalSection } from '../widgets/JournalSection';
import { WhiteboardButton } from '../widgets/WhiteboardButton';
import { QuoteFooter } from '../widgets/QuoteFooter';
import { QuickLinks } from '../sidebar/QuickLinks';
import { useSidebarWidgets } from '../../lib/stores/sidebar-widgets-store';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

export function Sidebar({ isOpen, onToggle, children }: SidebarProps) {
  const isLoading = useUIStore((s) => s.isLoading);
  const activeView = useUIStore((s) => s.activeView);
  const sidebarWidth = useUIStore((s) => s.sidebarWidth);
  const setSidebarWidth = useUIStore((s) => s.setSidebarWidth);
  const isResizing = useRef(false);
  const { enabledWidgets } = useSidebarWidgets();

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isResizing.current = true;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const handleMouseMove = (e: MouseEvent) => {
        if (isResizing.current) {
          setSidebarWidth(e.clientX);
        }
      };

      const handleMouseUp = () => {
        isResizing.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [setSidebarWidth],
  );

  return (
    <aside
      data-region="sidebar"
      className={`fixed left-0 top-0 h-screen bg-surface border-r border-border flex flex-col transition-transform duration-[250ms] ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ width: `${sidebarWidth}px` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-[16px] py-[16px]">
        <span className="text-[14px] font-semibold text-text-primary tracking-[-0.01em]">
          NewTab
        </span>
        <div className="flex items-center gap-[4px]">
          {!isLoading && <SidebarWidgetSettings />}
          <SidebarToggle isOpen={isOpen} onToggle={onToggle} />
        </div>
      </div>

      {/* Search */}
      {!isLoading && <SearchBar />}

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
            {enabledWidgets.has('pomodoro') && <PomodoroTimer />}
            {enabledWidgets.has('habits') && <HabitTracker />}
            {enabledWidgets.has('journal') && <JournalSection />}
            {enabledWidgets.has('whiteboard') && (
              <div className="border-t border-border px-[8px] py-[4px]">
                <WhiteboardButton />
              </div>
            )}
            {enabledWidgets.has('kanban') && (
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
            )}
          </div>
        )}
      </div>

      {/* Quick links - pinned above quote footer */}
      {!isLoading && enabledWidgets.has('quicklinks') && <QuickLinks />}

      {/* Quote footer - pinned to bottom, outside scrollable area */}
      {!isLoading && <QuoteFooter />}

      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute right-0 top-0 bottom-0 w-[4px] cursor-col-resize hover:bg-accent/20 transition-colors duration-150 z-10"
      />
    </aside>
  );
}
