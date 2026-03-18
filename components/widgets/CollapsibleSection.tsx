import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { useWidgetStore } from '../../lib/stores/widget-store';
import type { WidgetSectionId } from '../../lib/storage/types';

interface CollapsibleSectionProps {
  id: WidgetSectionId;
  title: string;
  children: ReactNode;
  rightAction?: ReactNode;
}

export function CollapsibleSection({ id, title, children, rightAction }: CollapsibleSectionProps) {
  const toggleSection = useWidgetStore((s) => s.toggleSection);
  const collapsed = useWidgetStore((s) => s.isSectionCollapsed(id));

  return (
    <div className="border-t border-border">
      <button
        type="button"
        onClick={() => toggleSection(id)}
        className="flex w-full items-center justify-between px-[16px] py-[8px]"
      >
        <span className="text-[12px] uppercase tracking-[0.05em] text-text-secondary font-normal">
          {title}
        </span>
        <div className="flex items-center gap-[4px]">
          {rightAction && (
            <span
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              {rightAction}
            </span>
          )}
          <ChevronDown
            size={16}
            className={`text-text-secondary transition-transform duration-200 ease-in-out ${
              collapsed ? 'rotate-[-90deg]' : ''
            }`}
          />
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          collapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'
        }`}
      >
        <div className="px-[16px] pb-[8px]">
          {children}
        </div>
      </div>
    </div>
  );
}
