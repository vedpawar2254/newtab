import { describe, test, expect, afterEach } from 'vitest';
import { createTestEditor } from './helpers';
import {
  serializeContent,
  deserializeContent,
  CURRENT_SCHEMA_VERSION,
} from '../../lib/editor/schema-migrations';
import type { Editor } from '@tiptap/core';

describe('Schema versioning', () => {
  let editor: Editor;

  afterEach(() => {
    editor?.destroy();
  });

  test('serializeContent wraps editor JSON with schema version', () => {
    editor = createTestEditor('<p>Hello world</p>');
    const serialized = serializeContent(editor);
    const parsed = JSON.parse(serialized);

    expect(parsed).toHaveProperty('schemaVersion');
    expect(parsed).toHaveProperty('doc');
    expect(parsed.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(parsed.doc.type).toBe('doc');
  });

  test('deserializeContent unwraps versioned content', () => {
    editor = createTestEditor('<p>Test content</p>');
    const serialized = serializeContent(editor);
    const result = deserializeContent(serialized);

    expect(result).toBeDefined();
    expect((result as any).type).toBe('doc');
    expect((result as any).content).toBeDefined();
  });

  test('deserializeContent handles empty string', () => {
    const result = deserializeContent('');
    expect(result).toBeNull();
  });

  test('deserializeContent handles null-like input', () => {
    const result = deserializeContent('   ');
    expect(result).toBeNull();
  });

  test('deserializeContent handles legacy unversioned content', () => {
    // A plain Tiptap JSON without the schemaVersion wrapper
    const legacyContent = JSON.stringify({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'legacy' }] }],
    });

    const result = deserializeContent(legacyContent);
    expect(result).toBeDefined();
    expect((result as any).type).toBe('doc');
  });

  test('round-trip: serialize then deserialize preserves content structure', () => {
    editor = createTestEditor('<p>Round trip test</p>');
    const serialized = serializeContent(editor);
    const deserialized = deserializeContent(serialized) as any;

    expect(deserialized.type).toBe('doc');
    const paragraph = deserialized.content?.[0];
    expect(paragraph?.type).toBe('paragraph');
    const text = paragraph?.content?.[0];
    expect(text?.text).toBe('Round trip test');
  });

  test('deserializeContent handles corrupted JSON', () => {
    const result = deserializeContent('not valid json{{{');
    expect(result).toBeNull();
  });
});
