import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Dexie db before importing storageService
vi.mock('../lib/storage/db', () => {
  const notesStore = new Map<string, any>();
  const settingsStore = new Map<string, any>();
  return {
    db: {
      notes: {
        get: vi.fn(async (id: string) => notesStore.get(id)),
        put: vi.fn(async (note: any) => { notesStore.set(note.id, note); }),
        delete: vi.fn(async (id: string) => { notesStore.delete(id); }),
        toArray: vi.fn(async () => Array.from(notesStore.values())),
      },
      settings: {
        get: vi.fn(async (key: string) => settingsStore.get(key)),
        put: vi.fn(async (record: any) => { settingsStore.set(record.key, record); }),
      },
      _notesStore: notesStore,
      _settingsStore: settingsStore,
    },
  };
});

import { storageService } from '../lib/storage/storage-service';
import { db } from '../lib/storage/db';

function makeNote(id: string, title = 'Test Note') {
  return {
    id,
    title,
    content: '',
    parentId: null,
    order: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    schemaVersion: 1,
  };
}

describe('StorageService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    // Clear mock stores
    (db as any)._notesStore.clear();
    (db as any)._settingsStore.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('granular: saves notes with individual IDs, not as a blob', async () => {
    const note1 = makeNote('note-1', 'First');
    const note2 = makeNote('note-2', 'Second');
    const note3 = makeNote('note-3', 'Third');

    storageService.saveNote(note1);
    storageService.saveNote(note2);
    storageService.saveNote(note3);

    await storageService.flushAll();

    expect(db.notes.put).toHaveBeenCalledTimes(3);
    const putCalls = (db.notes.put as any).mock.calls;
    const savedIds = putCalls.map((call: any[]) => call[0].id);
    expect(savedIds).toContain('note-1');
    expect(savedIds).toContain('note-2');
    expect(savedIds).toContain('note-3');
  });

  it('persists: loadNote returns a previously saved note after flush', async () => {
    const note = makeNote('persist-1', 'Persistent Note');
    storageService.saveNote(note);
    await storageService.flushAll();

    const loaded = await storageService.loadNote('persist-1');
    expect(loaded).toBeDefined();
    expect(loaded!.id).toBe('persist-1');
    expect(loaded!.title).toBe('Persistent Note');
  });

  it('cache: loadNote returns cached note without hitting db on second call', async () => {
    const note = makeNote('cache-1', 'Cached Note');
    // Put note directly in db mock store
    (db as any)._notesStore.set('cache-1', note);

    // First load - should call db.notes.get
    await storageService.loadNote('cache-1');
    const firstCallCount = (db.notes.get as any).mock.calls.length;

    // Second load - should use cache, not call db again
    await storageService.loadNote('cache-1');
    const secondCallCount = (db.notes.get as any).mock.calls.length;

    expect(secondCallCount).toBe(firstCallCount);
  });

  it('deleteNote: removes note from cache and db', async () => {
    const note = makeNote('del-1', 'Delete Me');
    storageService.saveNote(note);
    await storageService.flushAll();

    await storageService.deleteNote('del-1');

    expect(db.notes.delete).toHaveBeenCalledWith('del-1');

    // After delete, loadNote should return undefined from cache
    const loaded = await storageService.loadNote('del-1');
    // The note was deleted from cache, so it will try db which also has it deleted
    // db.notes.get will return undefined since we deleted from _notesStore
    expect(loaded).toBeUndefined();
  });

  it('saveNote: debounces writes with 300ms delay', () => {
    const note = makeNote('debounce-1', 'Debounce Test');
    storageService.saveNote(note);

    // Should NOT have called db.notes.put immediately
    expect(db.notes.put).not.toHaveBeenCalled();

    // Advance past debounce threshold
    vi.advanceTimersByTime(300);

    // Now it should have been called
    expect(db.notes.put).toHaveBeenCalled();
  });

  it('save events: emits success event after flush', async () => {
    const listener = vi.fn();
    const unsub = storageService.onSaveEvent(listener);

    const note = makeNote('event-1', 'Event Test');
    storageService.saveNote(note);
    await storageService.flushAll();

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'success', noteId: 'event-1' })
    );

    unsub();
  });

  it('storage usage: isStorageWarning returns true at 80%+', () => {
    expect(storageService.isStorageWarning({ used: 80, quota: 100, percent: 80 })).toBe(true);
    expect(storageService.isStorageWarning({ used: 81, quota: 100, percent: 81 })).toBe(true);
    expect(storageService.isStorageWarning({ used: 79, quota: 100, percent: 79 })).toBe(false);
  });
});
