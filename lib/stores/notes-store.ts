import { create } from 'zustand';
import { storageService } from '../storage/storage-service';
import type { NoteRecord, TreeIndex, TreeIndexEntry } from '../storage/types';

interface NotesState {
  treeIndex: TreeIndex | null;
  noteCache: Map<string, NoteRecord>;
  initialized: boolean;

  initialize: () => Promise<void>;
  getNote: (id: string) => Promise<NoteRecord | undefined>;
  createNote: (title: string, parentId?: string | null) => Promise<NoteRecord>;
  updateNote: (note: NoteRecord) => void;
  deleteNote: (id: string) => Promise<void>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  treeIndex: null,
  noteCache: new Map(),
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;
    try {
      const treeIndex = await storageService.loadTreeIndex();
      set({
        treeIndex: treeIndex ?? { entries: [], updatedAt: Date.now() },
        initialized: true,
      });
    } catch (err) {
      console.error('Failed to initialize notes store:', err);
      set({ initialized: true }); // Allow app to render even on error
    }
  },

  getNote: async (id: string) => {
    const cached = get().noteCache.get(id);
    if (cached) return cached;
    const note = await storageService.loadNote(id);
    if (note) {
      set((s) => {
        const newCache = new Map(s.noteCache);
        newCache.set(id, note);
        return { noteCache: newCache };
      });
    }
    return note;
  },

  createNote: async (title: string, parentId: string | null = null) => {
    const id = crypto.randomUUID();
    const now = Date.now();
    const note: NoteRecord = {
      id,
      title,
      content: '',
      parentId,
      order: 0,
      createdAt: now,
      updatedAt: now,
      schemaVersion: 1,
    };

    // Save note via storage service
    storageService.saveNote(note);

    // Update tree index
    const currentIndex = get().treeIndex ?? { entries: [], updatedAt: now };
    const newEntry: TreeIndexEntry = {
      id,
      title,
      parentId,
      childIds: [],
      order: currentIndex.entries.filter(e => e.parentId === parentId).length,
      path: parentId ? [...(currentIndex.entries.find(e => e.id === parentId)?.path ?? []), parentId] : [],
    };

    // If parent exists, add this note to parent's childIds
    const updatedEntries = currentIndex.entries.map(e =>
      e.id === parentId ? { ...e, childIds: [...e.childIds, id] } : e
    );
    updatedEntries.push(newEntry);

    const updatedIndex: TreeIndex = { entries: updatedEntries, updatedAt: now };
    await storageService.saveTreeIndex(updatedIndex);

    set((s) => {
      const newCache = new Map(s.noteCache);
      newCache.set(id, note);
      return { noteCache: newCache, treeIndex: updatedIndex };
    });

    return note;
  },

  updateNote: (note: NoteRecord) => {
    storageService.saveNote(note);
    set((s) => {
      const newCache = new Map(s.noteCache);
      newCache.set(note.id, { ...note, updatedAt: Date.now() });
      return { noteCache: newCache };
    });
  },

  deleteNote: async (id: string) => {
    await storageService.deleteNote(id);
    const currentIndex = get().treeIndex;
    if (currentIndex) {
      const updatedEntries = currentIndex.entries
        .filter(e => e.id !== id)
        .map(e => ({
          ...e,
          childIds: e.childIds.filter(cid => cid !== id),
        }));
      const updatedIndex: TreeIndex = { entries: updatedEntries, updatedAt: Date.now() };
      await storageService.saveTreeIndex(updatedIndex);
      set((s) => {
        const newCache = new Map(s.noteCache);
        newCache.delete(id);
        return { noteCache: newCache, treeIndex: updatedIndex };
      });
    }
  },
}));
