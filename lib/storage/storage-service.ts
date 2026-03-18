import { db } from './db';
import type { NoteRecord, TreeIndex, StorageUsage } from './types';

const DEBOUNCE_MS = 300;
const STORAGE_WARNING_PERCENT = 80;

type SaveEventListener = (event: { type: 'success' | 'error'; noteId: string; error?: Error }) => void;

class StorageService {
  private noteCache = new Map<string, NoteRecord>();
  private writeTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private listeners: SaveEventListener[] = [];

  onSaveEvent(listener: SaveEventListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emitSaveEvent(event: { type: 'success' | 'error'; noteId: string; error?: Error }) {
    this.listeners.forEach(l => l(event));
  }

  async loadNote(id: string): Promise<NoteRecord | undefined> {
    const cached = this.noteCache.get(id);
    if (cached) return cached;

    try {
      const note = await db.notes.get(id);
      if (note) this.noteCache.set(id, note);
      return note;
    } catch (err) {
      console.error(`Failed to load note ${id}:`, err);
      throw err;
    }
  }

  async loadAllNotes(): Promise<NoteRecord[]> {
    try {
      const notes = await db.notes.toArray();
      notes.forEach(n => this.noteCache.set(n.id, n));
      return notes;
    } catch (err) {
      console.error('Failed to load all notes:', err);
      throw err;
    }
  }

  saveNote(note: NoteRecord): void {
    const updated = { ...note, updatedAt: Date.now() };
    this.noteCache.set(note.id, updated);

    const existing = this.writeTimers.get(note.id);
    if (existing) clearTimeout(existing);

    this.writeTimers.set(
      note.id,
      setTimeout(async () => {
        try {
          await db.notes.put(this.noteCache.get(note.id)!);
          this.writeTimers.delete(note.id);
          this.emitSaveEvent({ type: 'success', noteId: note.id });
        } catch (err) {
          console.error(`Failed to save note ${note.id}:`, err);
          this.emitSaveEvent({ type: 'error', noteId: note.id, error: err as Error });
        }
      }, DEBOUNCE_MS)
    );
  }

  async deleteNote(id: string): Promise<void> {
    const timer = this.writeTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.writeTimers.delete(id);
    }
    this.noteCache.delete(id);
    try {
      await db.notes.delete(id);
    } catch (err) {
      console.error(`Failed to delete note ${id}:`, err);
      throw err;
    }
  }

  async loadTreeIndex(): Promise<TreeIndex | null> {
    try {
      const record = await db.settings.get('tree-index');
      return record ? (record.value as TreeIndex) : null;
    } catch (err) {
      console.error('Failed to load tree index:', err);
      throw err;
    }
  }

  async saveTreeIndex(index: TreeIndex): Promise<void> {
    try {
      await db.settings.put({ key: 'tree-index', value: { ...index, updatedAt: Date.now() } });
    } catch (err) {
      console.error('Failed to save tree index:', err);
      throw err;
    }
  }

  async getStorageUsage(): Promise<StorageUsage> {
    const estimate = await navigator.storage.estimate();
    const used = estimate.usage ?? 0;
    const quota = estimate.quota ?? 0;
    return { used, quota, percent: quota > 0 ? (used / quota) * 100 : 0 };
  }

  isStorageWarning(usage: StorageUsage): boolean {
    return usage.percent >= STORAGE_WARNING_PERCENT;
  }

  flushAll(): Promise<void> {
    // Force all pending writes immediately
    const promises: Promise<void>[] = [];
    this.writeTimers.forEach((timer, id) => {
      clearTimeout(timer);
      this.writeTimers.delete(id);
      const cached = this.noteCache.get(id);
      if (cached) {
        promises.push(db.notes.put(cached).then(() => {
          this.emitSaveEvent({ type: 'success', noteId: id });
        }));
      }
    });
    return Promise.all(promises).then(() => {});
  }
}

export const storageService = new StorageService();
