import { describe, test, expect, afterEach } from 'vitest';
import { createTestEditor } from './helpers';
import type { Editor } from '@tiptap/core';

describe('Code blocks', () => {
  let editor: Editor;

  afterEach(() => {
    editor?.destroy();
  });

  test('toggleCodeBlock creates a code block', () => {
    editor = createTestEditor('<p>some code</p>');
    editor.chain().focus().toggleCodeBlock().run();

    expect(editor.isActive('codeBlock')).toBe(true);
  });

  test('code block accepts language attribute', () => {
    editor = createTestEditor('<p>const x = 1;</p>');
    editor.chain().focus().toggleCodeBlock().run();

    // Set language attribute on the code block
    editor.chain().focus().updateAttributes('codeBlock', { language: 'javascript' }).run();

    const json = editor.getJSON();
    const codeBlock = json.content?.find((n: any) => n.type === 'codeBlock');
    expect(codeBlock).toBeDefined();
    expect(codeBlock?.attrs?.language).toBe('javascript');
  });

  test('code block can be toggled back to paragraph', () => {
    editor = createTestEditor('<p>some code</p>');
    editor.chain().focus().toggleCodeBlock().run();
    expect(editor.isActive('codeBlock')).toBe(true);

    editor.chain().focus().toggleCodeBlock().run();
    expect(editor.isActive('codeBlock')).toBe(false);
  });
});
