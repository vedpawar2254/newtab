import { useEffect } from 'react';
import { useUIStore } from '../lib/stores/ui-store';

export function useTodoPanelToggle() {
  const toggleTodoPanel = useUIStore((s) => s.toggleTodoPanel);
  const todoPanelOpen = useUIStore((s) => s.todoPanelOpen);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 't') {
        e.preventDefault();
        toggleTodoPanel();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [toggleTodoPanel]);

  return { todoPanelOpen, toggleTodoPanel };
}
