import { useEffect } from 'react';
import { useUIStore } from '../lib/stores/ui-store';

export function useCommandPalette() {
  const commandPaletteOpen = useUIStore((s) => s.commandPaletteOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        useUIStore.getState().toggleCommandPalette();
      }
      if (e.key === 'Escape' && useUIStore.getState().commandPaletteOpen) {
        e.preventDefault();
        useUIStore.getState().setCommandPaletteOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return { commandPaletteOpen, setCommandPaletteOpen };
}
