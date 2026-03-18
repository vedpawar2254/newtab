import { useSidebarToggle } from '../../hooks/useSidebarToggle';
import { useTodoPanelToggle } from '../../hooks/useTodoPanelToggle';
import { useFocusMode } from '../../hooks/useFocusMode';
import { useKeyboardNav } from '../../hooks/useKeyboardNav';
import { useUIStore } from '../../lib/stores/ui-store';
import { Sidebar } from './Sidebar';
import { SidebarToggle } from './SidebarToggle';
import { MainContent } from './MainContent';
import { SidebarSkeleton } from '../skeleton/SidebarSkeleton';
import { ContentSkeleton } from '../skeleton/ContentSkeleton';
import { Editor } from '../editor/Editor';
import { WhiteboardView } from '../widgets/WhiteboardView';
import { TodoPanel } from '../todo/TodoPanel';
import { TodoPanelToggle } from '../todo/TodoPanelToggle';

export function AppShell() {
  const { sidebarOpen, toggleSidebar } = useSidebarToggle();
  const { todoPanelOpen, toggleTodoPanel } = useTodoPanelToggle();
  const { focusMode } = useFocusMode();
  useKeyboardNav();
  const isLoading = useUIStore((s) => s.isLoading);
  const activeView = useUIStore((s) => s.activeView);

  return (
    <div className="flex h-screen w-screen bg-bg text-text-primary font-mono">
      <div
        className={`transition-transform duration-[250ms] ${
          focusMode ? '-translate-x-[240px]' : 'translate-x-0'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar}>
          {isLoading && <SidebarSkeleton />}
        </Sidebar>
      </div>

      {/* Toggle button visible when sidebar is closed */}
      {!sidebarOpen && !focusMode && (
        <div className="fixed top-[16px] left-[16px] z-10">
          <SidebarToggle isOpen={false} onToggle={toggleSidebar} />
        </div>
      )}

      {/* Todo panel toggle button */}
      {!focusMode && (
        <div
          className={`fixed top-[16px] z-40 transition-[right] duration-[250ms] ease-in-out ${
            todoPanelOpen ? 'right-[296px]' : 'right-[16px]'
          }`}
        >
          <TodoPanelToggle isOpen={todoPanelOpen} onToggle={toggleTodoPanel} />
        </div>
      )}

      <div
        className={`flex-1 transition-all duration-[250ms] ${
          focusMode
            ? 'ml-0 max-w-[720px] mx-auto'
            : sidebarOpen ? 'ml-[240px]' : 'ml-0'
        } ${!focusMode && todoPanelOpen ? 'mr-[280px]' : 'mr-0'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        {activeView === 'whiteboard' ? (
          <WhiteboardView />
        ) : (
          <MainContent editor={<Editor />}>
            {isLoading && <ContentSkeleton />}
          </MainContent>
        )}
      </div>

      <TodoPanel isOpen={todoPanelOpen && !focusMode} />
    </div>
  );
}
