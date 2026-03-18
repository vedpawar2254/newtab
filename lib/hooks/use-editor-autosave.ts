import { useEffect, useRef } from 'react';
import type { Editor } from '@tiptap/react';
import { serializeContent } from '../editor/schema-migrations';
import { useNotesStore } from '../stores/notes-store';

const DEBOUNCE_MS = 300;

export function useEditorAutosave(
  editor: Editor | null,
  noteId: string | null,
): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteIdRef = useRef(noteId);
  noteIdRef.current = noteId;

  useEffect(() => {
    if (!editor || !noteId) return;

    const handleUpdate = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        const currentNoteId = noteIdRef.current;
        if (!currentNoteId) return;

        const content = serializeContent(editor);
        const state = useNotesStore.getState();
        const cached = state.noteCache.get(currentNoteId);
        if (cached) {
          state.updateNote({
            ...cached,
            content,
          });
        }
      }, DEBOUNCE_MS);
    };

    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        // Flush pending save on cleanup
        const currentNoteId = noteIdRef.current;
        if (currentNoteId) {
          const content = serializeContent(editor);
          const state = useNotesStore.getState();
          const cached = state.noteCache.get(currentNoteId);
          if (cached) {
            state.updateNote({
              ...cached,
              content,
            });
          }
        }
        timerRef.current = null;
      }
    };
  }, [editor, noteId]);
}
