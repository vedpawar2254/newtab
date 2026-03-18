import Dexie, { type EntityTable } from 'dexie';
import type { NoteRecord, SettingsRecord } from './types';

class NewTabDB extends Dexie {
  notes!: EntityTable<NoteRecord, 'id'>;
  settings!: EntityTable<SettingsRecord, 'key'>;

  constructor() {
    super('newtab-db');
    this.version(1).stores({
      notes: 'id, parentId, updatedAt',
      settings: 'key',
    });
  }
}

export const db = new NewTabDB();
