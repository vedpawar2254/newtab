import type { Editor } from '@tiptap/react';

export const CURRENT_SCHEMA_VERSION = 1;

export interface StoredDocument {
  schemaVersion: number;
  doc: unknown;
}

export function serializeContent(editor: Editor): string {
  const json = editor.getJSON();
  const stored: StoredDocument = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    doc: json,
  };
  return JSON.stringify(stored);
}

export function deserializeContent(raw: string): unknown | null {
  if (!raw || raw.trim() === '') {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);

    // Check if it has the StoredDocument wrapper
    if (
      parsed &&
      typeof parsed === 'object' &&
      'schemaVersion' in parsed &&
      'doc' in parsed
    ) {
      const stored = parsed as StoredDocument;
      // Run migration chain if needed (currently only v1)
      if (stored.schemaVersion < CURRENT_SCHEMA_VERSION) {
        return migrate(stored);
      }
      return stored.doc;
    }

    // Legacy content without wrapper -- treat as v1 doc directly
    return parsed;
  } catch {
    // If JSON parsing fails, return null (corrupted data)
    return null;
  }
}

function migrate(stored: StoredDocument): unknown {
  let { schemaVersion, doc } = stored;

  // Migration chain: add cases as schema evolves
  // e.g. if (schemaVersion === 1) { doc = migrateV1toV2(doc); schemaVersion = 2; }

  // For now, v1 is current -- no migrations needed
  return doc;
}
