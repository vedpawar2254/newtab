import { useEffect } from 'react';
import { useUIStore } from '../lib/stores/ui-store';
import { useToast } from './useToast';

export function useFocusMode() {
  const focusMode = useUIStore((s) => s.focusMode);
  const { addToast } = useToast();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '.') {
        e.preventDefault();
        const currentFocusMode = useUIStore.getState().focusMode;
        useUIStore.getState().toggleFocusMode();
        if (!currentFocusMode) {
          addToast('Focus mode on', 'info');
        } else {
          addToast('Focus mode off', 'info');
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [addToast]);

  return { focusMode };
}
