import Dexie, { type EntityTable } from 'dexie';
import type { NoteRecord, SettingsRecord, TaskRecord } from './types';

class NewTabDB extends Dexie {
  notes!: EntityTable<NoteRecord, 'id'>;
  settings!: EntityTable<SettingsRecord, 'key'>;
  tasks!: EntityTable<TaskRecord, 'id'>;

  constructor() {
    super('newtab-db');
    this.version(1).stores({
      notes: 'id, parentId, updatedAt',
      settings: 'key',
    });
    this.version(2).stores({
      notes: 'id, parentId, updatedAt',
      settings: 'key',
      tasks: 'id, columnId, order',
    });
  }
}

export const db = new NewTabDB();
