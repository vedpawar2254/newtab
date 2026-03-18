import { useEffect, useState } from 'react';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { AppShell } from '../../components/layout/AppShell';
import { ToastProvider } from '../../hooks/useToast';
import { ToastContainer } from '../../components/feedback/ToastContainer';
import { SaveStatus } from '../../components/feedback/SaveStatus';
import { useUIStore } from '../../lib/stores/ui-store';
import { useNotesStore } from '../../lib/stores/notes-store';
import { storageService } from '../../lib/storage/storage-service';

export function App() {
  const setLoading = useUIStore((s) => s.setLoading);
  const initialize = useNotesStore((s) => s.initialize);
  const [saveVisible, setSaveVisible] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initialize();
      setLoading(false);
    };
    init();
  }, [initialize, setLoading]);

  useEffect(() => {
    return storageService.onSaveEvent((event) => {
      if (event.type === 'success') {
        setSaveVisible(true);
        setTimeout(() => setSaveVisible(false), 100);
      }
    });
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppShell />
        <SaveStatus visible={saveVisible} />
        <ToastContainer />
      </ToastProvider>
    </ErrorBoundary>
  );
}
