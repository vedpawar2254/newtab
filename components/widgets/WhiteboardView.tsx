import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useUIStore } from '../../lib/stores/ui-store';
import { db } from '../../lib/storage/db';

// Lazy-load Excalidraw -- bundle not fetched until component renders
const ExcalidrawComponent = React.lazy(() =>
  import('@excalidraw/excalidraw').then((mod) => ({
    default: mod.Excalidraw,
  }))
);

const SETTINGS_KEY = 'whiteboard-scene';
const DEBOUNCE_MS = 300;

export function WhiteboardView() {
  const setActiveView = useUIStore((s) => s.setActiveView);
  const [initialData, setInitialData] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved scene on mount
  useEffect(() => {
    const load = async () => {
      try {
        const record = await db.settings.get(SETTINGS_KEY);
        if (record?.value) {
          setInitialData(record.value);
        }
      } catch (err) {
        console.error('Failed to load whiteboard scene:', err);
      }
      setLoaded(true);
    };
    load();
  }, []);

  // Persist scene on change with debounce
  const handleChange = useCallback((elements: any, appState: any) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await db.settings.put({
          key: SETTINGS_KEY,
          value: { elements, appState: { viewBackgroundColor: appState.viewBackgroundColor } },
        });
      } catch (err) {
        console.error('Failed to save whiteboard scene:', err);
      }
    }, DEBOUNCE_MS);
  }, []);

  // Escape key to go back
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveView('editor');
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [setActiveView]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  return (
    <div className="w-full h-screen bg-bg flex flex-col">
      {/* Back button */}
      <div className="px-[16px] py-[12px]">
        <button
          onClick={() => setActiveView('editor')}
          className="flex items-center gap-[8px] text-text-secondary hover:text-text-primary transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-[4px]"
        >
          <ArrowLeft size={20} />
          <span className="text-[14px]">Back to notes</span>
        </button>
      </div>

      {/* Excalidraw container */}
      <div className="flex-1">
        {loaded ? (
          <Suspense
            fallback={
              <div className="w-full h-full bg-bg animate-[shimmer_1500ms_linear_infinite] bg-[length:200%_100%] bg-gradient-to-r from-bg via-surface to-bg" />
            }
          >
            <ExcalidrawComponent
              theme="dark"
              initialData={initialData ? { elements: initialData.elements, appState: initialData.appState } : undefined}
              onChange={handleChange}
            />
          </Suspense>
        ) : (
          <div className="w-full h-full bg-bg animate-[shimmer_1500ms_linear_infinite] bg-[length:200%_100%] bg-gradient-to-r from-bg via-surface to-bg" />
        )}
      </div>
    </div>
  );
}
