import { useEffect, useRef } from 'react';
import { useUIStore } from '../lib/stores/ui-store';
import { useToast } from './useToast';

export function useFocusMode() {
  const focusMode = useUIStore((s) => s.focusMode);
  const { addToast } = useToast();
  const addToastRef = useRef(addToast);
  addToastRef.current = addToast;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '.') {
        e.preventDefault();
        const currentFocusMode = useUIStore.getState().focusMode;
        useUIStore.getState().toggleFocusMode();
        if (!currentFocusMode) {
          addToastRef.current('Focus mode on', 'info');
        } else {
          addToastRef.current('Focus mode off', 'info');
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return { focusMode };
}
