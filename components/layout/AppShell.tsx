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
  const sidebarWidth = useUIStore((s) => s.sidebarWidth);

  // Whiteboard takes over the full viewport -- no sidebar, no todo panel
  if (activeView === 'whiteboard') {
    return (
      <div className="h-screen w-screen bg-bg text-text-primary font-mono">
        <WhiteboardView />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-bg text-text-primary font-mono">
      <div
        className={`transition-transform duration-[250ms]`}
        style={{
          transform: focusMode ? `translateX(-${sidebarWidth}px)` : 'translateX(0)',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
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
        className="flex-1 transition-all duration-[250ms]"
        style={{
          marginLeft: focusMode ? 0 : sidebarOpen ? `${sidebarWidth}px` : 0,
          marginRight: !focusMode && todoPanelOpen ? '280px' : 0,
          maxWidth: focusMode ? '720px' : undefined,
          marginInline: focusMode ? 'auto' : undefined,
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <MainContent editor={<Editor />}>
          {isLoading && <ContentSkeleton />}
        </MainContent>
      </div>

      <TodoPanel isOpen={todoPanelOpen && !focusMode} />
    </div>
  );
}
