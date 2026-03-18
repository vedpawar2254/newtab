import { Plus } from 'lucide-react';
import { useUIStore } from '../../lib/stores/ui-store';
import { SidebarToggle } from './SidebarToggle';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

export function Sidebar({ isOpen, onToggle, children }: SidebarProps) {
  const isLoading = useUIStore((s) => s.isLoading);

  return (
    <aside
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

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-[16px]">
        {isLoading ? (
          children
        ) : (
          <p className="text-[12px] text-text-secondary">No pages yet</p>
        )}
      </nav>

      {/* Bottom action */}
      <div className="px-[16px] py-[16px]">
        <button className="flex items-center gap-[8px] text-accent text-[14px] py-[8px] px-[16px] w-full rounded hover:bg-surface-elevated transition-colors duration-150">
          <Plus size={16} />
          <span>New Page</span>
        </button>
      </div>
    </aside>
  );
}
