import { create } from 'zustand';
import { db } from '../storage/db';
import { useNotesStore } from './notes-store';

interface JournalEntry {
  id: string;
  title: string;
  createdAt: number;
}

const JOURNAL_PROMPTS_CONTENT = JSON.stringify({
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'What are you grateful for?' }] },
    { type: 'paragraph' },
    { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: "What's your focus today?" }] },
    { type: 'paragraph' },
    { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'How are you feeling?' }] },
    { type: 'paragraph' },
  ],
});

interface JournalStoreState {
  recentEntries: JournalEntry[];
  initialized: boolean;

  loadRecentEntries: () => Promise<void>;
  createTodayEntry: () => Promise<string>;
  hasTodayEntry: () => boolean;
  getTodayEntryId: () => string | null;
}

export const useJournalStore = create<JournalStoreState>((set, get) => ({
  recentEntries: [],
  initialized: false,

  loadRecentEntries: async () => {
    try {
      const record = await db.settings.get('journal-entry-ids');
      if (record) {
        const data = record.value as { noteIds: string[] };
        const entries: JournalEntry[] = [];
        const notesStore = useNotesStore.getState();

        for (const noteId of data.noteIds.slice(0, 7)) {
          const note = await notesStore.getNote(noteId);
          if (note) {
            entries.push({ id: note.id, title: note.title, createdAt: note.createdAt });
          }
        }
        set({ recentEntries: entries, initialized: true });
      } else {
        set({ initialized: true });
      }
    } catch (err) {
      console.error('Failed to load journal entries:', err);
      set({ initialized: true });
    }
  },

  createTodayEntry: async () => {
    const title = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const notesStore = useNotesStore.getState();
    const note = await notesStore.createNote(title, null);

    // Update note content with journal prompts
    notesStore.updateNote({
      ...note,
      content: JOURNAL_PROMPTS_CONTENT,
    });

    // Update journal entry IDs in settings
    const record = await db.settings.get('journal-entry-ids');
    const existing = record ? (record.value as { noteIds: string[] }).noteIds : [];
    await db.settings.put({
      key: 'journal-entry-ids',
      value: { noteIds: [note.id, ...existing], updatedAt: Date.now() },
    });

    // Update local state
    set((s) => ({
      recentEntries: [
        { id: note.id, title, createdAt: note.createdAt },
        ...s.recentEntries,
      ].slice(0, 7),
    }));

    return note.id;
  },

  hasTodayEntry: () => {
    const { recentEntries } = get();
    if (recentEntries.length === 0) return false;
    const todayTitle = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    return recentEntries[0].title === todayTitle;
  },

  getTodayEntryId: () => {
    const { hasTodayEntry, recentEntries } = get();
    if (hasTodayEntry()) return recentEntries[0].id;
    return null;
  },
}));
