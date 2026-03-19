import type { Editor } from '@tiptap/react';
import { requestUrlInput } from './url-input-event';

export interface SlashItem {
  title: string;
  description?: string;
  icon: string;
  category: string;
  command: (editor: Editor) => void;
}

export const slashItems: SlashItem[] = [
  // Text category
  {
    title: 'Paragraph',
    icon: 'Type',
    category: 'Text',
    command: (editor) => {
      editor.chain().focus().setParagraph().run();
    },
  },
  {
    title: 'Heading 1',
    icon: 'Heading1',
    category: 'Text',
    command: (editor) => {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    },
  },
  {
    title: 'Heading 2',
    icon: 'Heading2',
    category: 'Text',
    command: (editor) => {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    },
  },
  {
    title: 'Heading 3',
    icon: 'Heading3',
    category: 'Text',
    command: (editor) => {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    },
  },

  // Lists category
  {
    title: 'Bullet List',
    icon: 'List',
    category: 'Lists',
    command: (editor) => {
      editor.chain().focus().toggleBulletList().run();
    },
  },
  {
    title: 'Numbered List',
    icon: 'ListOrdered',
    category: 'Lists',
    command: (editor) => {
      editor.chain().focus().toggleOrderedList().run();
    },
  },
  {
    title: 'Todo List',
    icon: 'CheckSquare',
    category: 'Lists',
    command: (editor) => {
      editor.chain().focus().toggleTaskList().run();
    },
  },

  // Media category
  {
    title: 'Image',
    icon: 'Image',
    description: 'Embed an image',
    category: 'Media',
    command: (editor) => {
      requestUrlInput('Enter image URL', (url) => {
        editor.chain().focus().setImage({ src: url }).run();
      });
    },
  },
  {
    title: 'Code Block',
    icon: 'Code',
    category: 'Media',
    command: (editor) => {
      editor.chain().focus().toggleCodeBlock().run();
    },
  },
  {
    title: 'Table',
    icon: 'Table',
    description: 'Insert a table',
    category: 'Media',
    command: (editor) => {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    },
  },
  {
    title: 'Link Embed',
    icon: 'Link',
    description: 'Embed a link with preview',
    category: 'Media',
    command: (editor) => {
      requestUrlInput('Enter URL', (url) => {
        editor.chain().focus().setLink({ href: url }).run();
      });
    },
  },

  // Advanced category
  {
    title: 'Blockquote',
    icon: 'Quote',
    category: 'Advanced',
    command: (editor) => {
      editor.chain().focus().toggleBlockquote().run();
    },
  },
  {
    title: 'Horizontal Rule',
    icon: 'Minus',
    category: 'Advanced',
    command: (editor) => {
      editor.chain().focus().setHorizontalRule().run();
    },
  },
];
