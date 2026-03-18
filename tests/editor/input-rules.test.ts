import { describe, test, expect, afterEach } from 'vitest';
import { createTestEditor } from './helpers';
import type { Editor } from '@tiptap/core';

/**
 * Tiptap input rules fire via ProseMirror's handleTextInput, which requires
 * real DOM input events. In unit tests, we verify the same behavior by:
 * 1. Testing the commands that input rules invoke (same end result)
 * 2. Verifying input rule plugins are registered on the editor
 */
describe('Markdown input rules', () => {
  let editor: Editor;

  afterEach(() => {
    editor?.destroy();
  });

  // Verify input rule plugins are registered
  test('editor has input rule plugins registered', () => {
    editor = createTestEditor('<p></p>');
    const plugins = editor.view.state.plugins;
    // Input rules create plugins with isInputRules key
    const hasInputRules = plugins.some(
      (p) => (p.spec as any).isInputRules === true,
    );
    expect(hasInputRules).toBe(true);
  });

  // Test heading commands (input rule "# " triggers toggleHeading)
  test('# input rule behavior: heading level 1', () => {
    editor = createTestEditor('<p>Title text</p>');
    editor.chain().focus().setTextSelection(1).toggleHeading({ level: 1 }).run();

    const json = editor.getJSON();
    const firstNode = json.content?.[0];
    expect(firstNode?.type).toBe('heading');
    expect(firstNode?.attrs?.level).toBe(1);
  });

  test('## input rule behavior: heading level 2', () => {
    editor = createTestEditor('<p>Subtitle</p>');
    editor.chain().focus().setTextSelection(1).toggleHeading({ level: 2 }).run();

    const json = editor.getJSON();
    const firstNode = json.content?.[0];
    expect(firstNode?.type).toBe('heading');
    expect(firstNode?.attrs?.level).toBe(2);
  });

  test('### input rule behavior: heading level 3', () => {
    editor = createTestEditor('<p>Section</p>');
    editor.chain().focus().setTextSelection(1).toggleHeading({ level: 3 }).run();

    const json = editor.getJSON();
    const firstNode = json.content?.[0];
    expect(firstNode?.type).toBe('heading');
    expect(firstNode?.attrs?.level).toBe(3);
  });

  // Test bold mark (input rule "**text**" triggers toggleBold)
  test('**text** input rule behavior: bold mark', () => {
    editor = createTestEditor('<p>hello world</p>');
    editor.chain().focus().setTextSelection({ from: 7, to: 12 }).toggleBold().run();

    expect(editor.isActive('bold')).toBe(true);
    const json = editor.getJSON();
    const paragraph = json.content?.[0];
    const hasBold = paragraph?.content?.some((node: any) =>
      node.marks?.some((m: any) => m.type === 'bold'),
    );
    expect(hasBold).toBe(true);
  });

  // Test bullet list (input rule "- " triggers toggleBulletList)
  test('- input rule behavior: bullet list', () => {
    editor = createTestEditor('<p>Item text</p>');
    editor.chain().focus().toggleBulletList().run();

    const json = editor.getJSON();
    const firstNode = json.content?.[0];
    expect(firstNode?.type).toBe('bulletList');
  });

  // Test ordered list (input rule "1. " triggers toggleOrderedList)
  test('1. input rule behavior: ordered list', () => {
    editor = createTestEditor('<p>First item</p>');
    editor.chain().focus().toggleOrderedList().run();

    const json = editor.getJSON();
    const firstNode = json.content?.[0];
    expect(firstNode?.type).toBe('orderedList');
  });

  // Test task list (input rule "[] " triggers toggleTaskList)
  test('[] input rule behavior: task list', () => {
    editor = createTestEditor('<p>Task item</p>');
    editor.chain().focus().toggleTaskList().run();

    const json = editor.getJSON();
    const firstNode = json.content?.[0];
    expect(firstNode?.type).toBe('taskList');
  });
});
