import { useState, useRef, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { useSidebarWidgets, type SidebarWidgetId } from '../../lib/stores/sidebar-widgets-store';

const WIDGET_LABELS: { id: SidebarWidgetId; label: string }[] = [
  { id: 'pomodoro', label: 'Pomodoro' },
  { id: 'habits', label: 'Habits' },
  { id: 'journal', label: 'Journal' },
  { id: 'whiteboard', label: 'Whiteboard' },
  { id: 'kanban', label: 'Kanban Board' },
  { id: 'quicklinks', label: 'Quick Links' },
];

export function SidebarWidgetSettings() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { enabledWidgets, toggleWidget } = useSidebarWidgets();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-[4px] rounded-[4px] text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors duration-150"
        title="Configure sidebar widgets"
      >
        <Settings size={14} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-[4px] w-[180px] bg-surface-elevated border border-border rounded-[6px] shadow-lg z-50 py-[4px]">
          <div className="px-[10px] py-[6px] text-[11px] text-text-secondary uppercase tracking-[0.05em]">
            Sidebar Widgets
          </div>
          {WIDGET_LABELS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => toggleWidget(id)}
              className="flex items-center gap-[8px] w-full px-[10px] py-[6px] text-[13px] text-text-primary hover:bg-active-item-bg transition-colors duration-100"
            >
              <span
                className={`w-[14px] h-[14px] rounded-[3px] border flex items-center justify-center shrink-0 ${
                  enabledWidgets.has(id)
                    ? 'bg-accent border-accent'
                    : 'border-border-strong bg-transparent'
                }`}
              >
                {enabledWidgets.has(id) && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
