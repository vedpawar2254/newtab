import { describe, test, expect, afterEach } from 'vitest';
import { createTestEditor } from './helpers';
import type { Editor } from '@tiptap/core';

describe('Rich text formatting', () => {
  let editor: Editor;

  afterEach(() => {
    editor?.destroy();
  });

  test('toggleBold adds bold mark to selected text', () => {
    editor = createTestEditor('<p>hello world</p>');
    // Select "world" (positions: "hello " = 7 chars from start, "world" = 5 chars)
    // In Tiptap, position 1 is start of first text node content
    editor.chain().focus().setTextSelection({ from: 7, to: 12 }).toggleBold().run();

    expect(editor.isActive('bold')).toBe(true);
    const json = editor.getJSON();
    const paragraph = json.content?.[0];
    const marks = paragraph?.content?.find((n: any) =>
      n.marks?.some((m: any) => m.type === 'bold'),
    );
    expect(marks).toBeDefined();
  });

  test('toggleItalic adds italic mark', () => {
    editor = createTestEditor('<p>hello world</p>');
    editor.chain().focus().setTextSelection({ from: 7, to: 12 }).toggleItalic().run();

    expect(editor.isActive('italic')).toBe(true);
  });

  test('toggleUnderline adds underline mark', () => {
    editor = createTestEditor('<p>hello world</p>');
    editor.chain().focus().setTextSelection({ from: 7, to: 12 }).toggleUnderline().run();

    expect(editor.isActive('underline')).toBe(true);
  });

  test('toggleStrike adds strikethrough mark', () => {
    editor = createTestEditor('<p>hello world</p>');
    editor.chain().focus().setTextSelection({ from: 7, to: 12 }).toggleStrike().run();

    expect(editor.isActive('strike')).toBe(true);
  });

  test('toggleHeading sets heading level', () => {
    editor = createTestEditor('<p>My Heading</p>');
    editor.chain().focus().toggleHeading({ level: 1 }).run();

    expect(editor.isActive('heading', { level: 1 })).toBe(true);
  });

  test('toggleHeading level 2', () => {
    editor = createTestEditor('<p>My Heading</p>');
    editor.chain().focus().toggleHeading({ level: 2 }).run();

    expect(editor.isActive('heading', { level: 2 })).toBe(true);
  });

  test('toggleBulletList creates bullet list', () => {
    editor = createTestEditor('<p>List item</p>');
    editor.chain().focus().toggleBulletList().run();

    expect(editor.isActive('bulletList')).toBe(true);
  });

  test('toggleOrderedList creates ordered list', () => {
    editor = createTestEditor('<p>List item</p>');
    editor.chain().focus().toggleOrderedList().run();

    expect(editor.isActive('orderedList')).toBe(true);
  });

  test('toggleTaskList creates task list', () => {
    editor = createTestEditor('<p>Task item</p>');
    editor.chain().focus().toggleTaskList().run();

    expect(editor.isActive('taskList')).toBe(true);
  });

  test('toggleCode adds inline code mark', () => {
    editor = createTestEditor('<p>hello world</p>');
    editor.chain().focus().setTextSelection({ from: 7, to: 12 }).toggleCode().run();

    expect(editor.isActive('code')).toBe(true);
  });
});
