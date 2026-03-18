import { useEffect } from 'react';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { AppShell } from '../../components/layout/AppShell';
import { useUIStore } from '../../lib/stores/ui-store';
import { useNotesStore } from '../../lib/stores/notes-store';

export function App() {
  const setLoading = useUIStore((s) => s.setLoading);
  const initialize = useNotesStore((s) => s.initialize);

  useEffect(() => {
    const init = async () => {
      await initialize();
      setLoading(false);
    };
    init();
  }, [initialize, setLoading]);

  return (
    <ErrorBoundary>
      <AppShell />
    </ErrorBoundary>
  );
}
