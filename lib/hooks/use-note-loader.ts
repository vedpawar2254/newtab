import { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { deserializeContent } from '../editor/schema-migrations';
import { useNotesStore } from '../stores/notes-store';
import type { NoteRecord } from '../storage/types';

interface UseNoteLoaderResult {
  note: NoteRecord | null;
  isLoading: boolean;
}

export function useNoteLoader(
  editor: Editor | null,
  noteId: string | null,
): UseNoteLoaderResult {
  const [note, setNote] = useState<NoteRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!editor || !noteId) {
      setNote(null);
      if (editor) {
        editor.commands.setContent('');
      }
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const load = async () => {
      const state = useNotesStore.getState();
      const loaded = await state.getNote(noteId);

      if (cancelled) return;

      if (loaded) {
        setNote(loaded);
        const content = deserializeContent(loaded.content);
        editor.commands.setContent(content ?? '');
      } else {
        setNote(null);
        editor.commands.setContent('');
      }

      setIsLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [editor, noteId]);

  return { note, isLoading };
}
