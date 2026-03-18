import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Image } from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Underline } from '@tiptap/extension-underline';
import FileHandler from '@tiptap/extension-file-handler';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { common, createLowlight } from 'lowlight';
import type { Extensions } from '@tiptap/react';
import { CodeBlockView } from '../../components/editor/CodeBlockView';
import { BookmarkCard } from './extensions/bookmark-card';

export const lowlightInstance = createLowlight(common);

export function createExtensions(): Extensions {
  return [
    StarterKit.configure({
      codeBlock: false,
    }),
    Underline,
    CodeBlockLowlight.configure({
      lowlight: lowlightInstance,
    }).extend({
      addNodeView() {
        return ReactNodeViewRenderer(CodeBlockView);
      },
    }),
    Table.configure({
      resizable: true,
      HTMLAttributes: { class: 'editor-table' },
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
    Placeholder.configure({
      placeholder: 'Type / for commands...',
    }),
    FileHandler.configure({
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
      onPaste: (editor, files) => {
        files.forEach((file) => {
          const reader = new FileReader();
          reader.onload = () => {
            editor
              .chain()
              .focus()
              .setImage({ src: reader.result as string })
              .run();
          };
          reader.readAsDataURL(file);
        });
      },
      onDrop: (editor, files, pos) => {
        files.forEach((file) => {
          const reader = new FileReader();
          reader.onload = () => {
            editor
              .chain()
              .focus()
              .setImage({ src: reader.result as string })
              .run();
          };
          reader.readAsDataURL(file);
        });
      },
    }),
    BookmarkCard,
  ];
}
