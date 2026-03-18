import { useSidebarToggle } from '../../hooks/useSidebarToggle';
import { useUIStore } from '../../lib/stores/ui-store';
import { Sidebar } from './Sidebar';
import { SidebarToggle } from './SidebarToggle';
import { MainContent } from './MainContent';
import { SidebarSkeleton } from '../skeleton/SidebarSkeleton';
import { ContentSkeleton } from '../skeleton/ContentSkeleton';
import { Editor } from '../editor/Editor';
import { WhiteboardView } from '../widgets/WhiteboardView';

export function AppShell() {
  const { sidebarOpen, toggleSidebar } = useSidebarToggle();
  const isLoading = useUIStore((s) => s.isLoading);
  const activeView = useUIStore((s) => s.activeView);

  return (
    <div className="flex h-screen w-screen bg-bg text-text-primary font-mono">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar}>
        {isLoading && <SidebarSkeleton />}
      </Sidebar>

      {/* Toggle button visible when sidebar is closed */}
      {!sidebarOpen && (
        <div className="fixed top-[16px] left-[16px] z-10">
          <SidebarToggle isOpen={false} onToggle={toggleSidebar} />
        </div>
      )}

      <div
        className={`flex-1 transition-[margin-left] duration-[250ms] ease-in-out ${
          sidebarOpen ? 'ml-[240px]' : 'ml-0'
        }`}
      >
        {activeView === 'whiteboard' ? (
          <WhiteboardView />
        ) : (
          <MainContent editor={<Editor />}>
            {isLoading && <ContentSkeleton />}
          </MainContent>
        )}
      </div>
    </div>
  );
}
