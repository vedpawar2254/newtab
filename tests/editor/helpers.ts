import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Image } from '@tiptap/extension-image';
import { Underline } from '@tiptap/extension-underline';
import { common, createLowlight } from 'lowlight';
import type { Content } from '@tiptap/core';

const lowlight = createLowlight(common);

/**
 * Creates a Tiptap Editor instance suitable for testing.
 * Uses the same extensions as the real editor but without React node views
 * (CodeBlockView, BookmarkCardView, SlashCommand) since tests run outside React.
 */
export function createTestEditor(content?: Content): Editor {
  return new Editor({
    content: content ?? '<p></p>',
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Image.configure({
        allowBase64: true,
        inline: false,
      }),
    ],
  });
}

/**
 * Insert text at the current cursor position.
 */
export function typeText(editor: Editor, text: string): void {
  editor.chain().focus().insertContent(text).run();
}

/**
 * Simulate typing text character by character to trigger input rules.
 * Input rules in Tiptap fire on text insertion that matches a pattern.
 */
export function simulateInputRule(editor: Editor, text: string): void {
  for (const char of text) {
    editor.chain().focus().insertContent(char).run();
  }
}
