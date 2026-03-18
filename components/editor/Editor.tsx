import { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { createExtensions } from '../../lib/editor/extensions';
import { useEditorAutosave } from '../../lib/hooks/use-editor-autosave';
import { useNoteLoader } from '../../lib/hooks/use-note-loader';
import { EditorTitle } from './EditorTitle';
import { useUIStore } from '../../lib/stores/ui-store';
import { useNotesStore } from '../../lib/stores/notes-store';

export function Editor() {
  const activeNoteId = useUIStore((s) => s.activeNoteId);

  const editor = useEditor({
    extensions: createExtensions(),
    content: '',
    immediatelyRender: true,
    shouldRerenderOnTransaction: false,
  });

  useEditorAutosave(editor, activeNoteId);
  const { note } = useNoteLoader(editor, activeNoteId);

  const handleTitleChange = useCallback(
    (newTitle: string) => {
      if (!activeNoteId) return;
      const state = useNotesStore.getState();
      state.renameNote(activeNoteId, newTitle);
    },
    [activeNoteId],
  );

  const handleContainerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Only focus if clicking the empty area, not the editor itself
      if (
        editor &&
        e.target === e.currentTarget
      ) {
        editor.commands.focus('end');
      }
    },
    [editor],
  );

  if (!activeNoteId) {
    return null;
  }

  return (
    <div
      className="w-full cursor-text"
      onClick={handleContainerClick}
    >
      <EditorTitle
        title={note?.title ?? ''}
        noteId={activeNoteId}
        onTitleChange={handleTitleChange}
      />
      <EditorContent editor={editor} />
    </div>
  );
}
