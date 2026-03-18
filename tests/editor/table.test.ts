import { describe, test, expect, afterEach } from 'vitest';
import { createTestEditor } from './helpers';
import type { Editor } from '@tiptap/core';

function countRows(json: any): number {
  const table = json.content?.find((n: any) => n.type === 'table');
  return table?.content?.length ?? 0;
}

function countCols(json: any): number {
  const table = json.content?.find((n: any) => n.type === 'table');
  if (!table?.content?.[0]) return 0;
  return table.content[0].content?.length ?? 0;
}

describe('Tables', () => {
  let editor: Editor;

  afterEach(() => {
    editor?.destroy();
  });

  test('insertTable creates a 3x3 table with header', () => {
    editor = createTestEditor('<p></p>');
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();

    const json = editor.getJSON();
    const table = json.content?.find((n: any) => n.type === 'table');
    expect(table).toBeDefined();
    expect(countRows(json)).toBe(3);
    expect(countCols(json)).toBe(3);

    // First row should contain header cells
    const firstRow = table?.content?.[0];
    const hasHeaders = firstRow?.content?.some(
      (cell: any) => cell.type === 'tableHeader',
    );
    expect(hasHeaders).toBe(true);
  });

  test('addRowAfter adds a row', () => {
    editor = createTestEditor('<p></p>');
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();

    const initialRows = countRows(editor.getJSON());

    // Place cursor inside first cell (position after table start)
    // Table structure: table > tableRow > tableHeader > paragraph
    // We need to find a cell position. Position 4 is typically inside first header cell.
    editor.chain().focus().addRowAfter().run();

    const newRows = countRows(editor.getJSON());
    expect(newRows).toBe(initialRows + 1);
  });

  test('addColumnAfter adds a column', () => {
    editor = createTestEditor('<p></p>');
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();

    const initialCols = countCols(editor.getJSON());

    editor.chain().focus().addColumnAfter().run();

    const newCols = countCols(editor.getJSON());
    expect(newCols).toBe(initialCols + 1);
  });

  test('deleteTable removes the table', () => {
    editor = createTestEditor('<p></p>');
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();

    const hasBefore = editor.getJSON().content?.some((n: any) => n.type === 'table');
    expect(hasBefore).toBe(true);

    editor.chain().focus().deleteTable().run();

    const hasAfter = editor.getJSON().content?.some((n: any) => n.type === 'table');
    expect(hasAfter).toBeFalsy();
  });
});
