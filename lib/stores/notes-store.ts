import { create } from 'zustand';
import { db } from '../storage/db';
import { storageService } from '../storage/storage-service';
import type { NoteRecord, TreeIndex, TreeIndexEntry } from '../storage/types';
import { collectSubtreeIds, reindexSiblings } from '../utils/tree-utils';

interface NotesState {
  treeIndex: TreeIndex | null;
  noteCache: Map<string, NoteRecord>;
  initialized: boolean;

  initialize: () => Promise<void>;
  getNote: (id: string) => Promise<NoteRecord | undefined>;
  createNote: (title: string, parentId?: string | null) => Promise<NoteRecord>;
  updateNote: (note: NoteRecord) => void;
  deleteNote: (id: string) => Promise<void>;
  renameNote: (id: string, newTitle: string) => Promise<void>;
  cascadeDelete: (id: string) => Promise<void>;
  moveNote: (id: string, newParentId: string | null, newOrder: number) => Promise<void>;
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

  renameNote: async (id: string, newTitle: string) => {
    const currentIndex = get().treeIndex;
    if (!currentIndex) return;

    // Update note record in cache and storage
    const cached = get().noteCache.get(id);
    if (cached) {
      const updated = { ...cached, title: newTitle, updatedAt: Date.now() };
      storageService.saveNote(updated);
      set((s) => {
        const newCache = new Map(s.noteCache);
        newCache.set(id, updated);
        return { noteCache: newCache };
      });
    }

    // Update tree index entry title
    const updatedEntries = currentIndex.entries.map((e) =>
      e.id === id ? { ...e, title: newTitle } : e,
    );
    const updatedIndex: TreeIndex = { entries: updatedEntries, updatedAt: Date.now() };
    await storageService.saveTreeIndex(updatedIndex);
    set({ treeIndex: updatedIndex });
  },

  cascadeDelete: async (id: string) => {
    const currentIndex = get().treeIndex;
    if (!currentIndex) return;

    const descendantIds = collectSubtreeIds(currentIndex.entries, id);
    const allIds = [id, ...descendantIds];
    const allIdsSet = new Set(allIds);

    // Cancel pending write timers and clear storage cache
    for (const deleteId of allIds) {
      await storageService.deleteNote(deleteId);
    }

    // Bulk delete from DB for efficiency
    await db.notes.bulkDelete(allIds);

    // Find the deleted entry to get its parentId for reindexing
    const deletedEntry = currentIndex.entries.find((e) => e.id === id);
    const deletedParentId = deletedEntry?.parentId ?? null;

    // Update tree index: remove all deleted entries, clean up childIds
    let updatedEntries = currentIndex.entries
      .filter((e) => !allIdsSet.has(e.id))
      .map((e) => ({
        ...e,
        childIds: e.childIds.filter((cid) => !allIdsSet.has(cid)),
      }));

    // Reindex siblings at the deleted entry's level
    updatedEntries = reindexSiblings(updatedEntries, deletedParentId);

    const updatedIndex: TreeIndex = { entries: updatedEntries, updatedAt: Date.now() };
    await storageService.saveTreeIndex(updatedIndex);

    set((s) => {
      const newCache = new Map(s.noteCache);
      for (const deleteId of allIds) {
        newCache.delete(deleteId);
      }
      return { noteCache: newCache, treeIndex: updatedIndex };
    });
  },

  moveNote: async (
    id: string,
    newParentId: string | null,
    newOrder: number,
  ) => {
    const currentIndex = get().treeIndex;
    if (!currentIndex) return;

    const entry = currentIndex.entries.find((e) => e.id === id);
    if (!entry) return;

    const oldParentId = entry.parentId;

    // Build new path for the moved entry
    const newPath = newParentId
      ? [
          ...(currentIndex.entries.find((e) => e.id === newParentId)?.path ?? []),
          newParentId,
        ]
      : [];

    let updatedEntries = currentIndex.entries.map((e) => {
      if (e.id === id) {
        return { ...e, parentId: newParentId, order: newOrder, path: newPath };
      }
      // Remove from old parent's childIds
      if (e.id === oldParentId) {
        return { ...e, childIds: e.childIds.filter((cid) => cid !== id) };
      }
      // Add to new parent's childIds
      if (e.id === newParentId && !e.childIds.includes(id)) {
        return { ...e, childIds: [...e.childIds, id] };
      }
      return e;
    });

    // Update all descendant paths since parent path changed
    const descendantIds = collectSubtreeIds(currentIndex.entries, id);
    const updateDescendantPaths = (
      entries: TreeIndexEntry[],
    ): TreeIndexEntry[] => {
      return entries.map((e) => {
        if (descendantIds.includes(e.id)) {
          const parent = entries.find((p) => p.id === e.parentId);
          if (parent) {
            return { ...e, path: [...parent.path, parent.id] };
          }
        }
        return e;
      });
    };
    updatedEntries = updateDescendantPaths(updatedEntries);

    // Reindex siblings in both old and new parent groups
    updatedEntries = reindexSiblings(updatedEntries, oldParentId);
    if (newParentId !== oldParentId) {
      updatedEntries = reindexSiblings(updatedEntries, newParentId);
    }

    const updatedIndex: TreeIndex = { entries: updatedEntries, updatedAt: Date.now() };
    await storageService.saveTreeIndex(updatedIndex);
    set({ treeIndex: updatedIndex });
  },
}));
