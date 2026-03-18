export interface NoteRecord {
  id: string;
  title: string;
  content: string; // JSON string (editor content in Phase 2+, empty string in Phase 1)
  parentId: string | null;
  order: number;
  createdAt: number;
  updatedAt: number;
  schemaVersion: number;
}

export interface TreeIndexEntry {
  id: string;
  title: string;
  parentId: string | null;
  childIds: string[];
  order: number;
  path: string[];  // breadcrumb path of parent IDs
}

export interface TreeIndex {
  entries: TreeIndexEntry[];
  updatedAt: number;
}

export interface SettingsRecord {
  key: string;
  value: unknown;
}

export interface StorageUsage {
  used: number;
  quota: number;
  percent: number;
}
