import { DragHandle as DragHandleReact } from '@tiptap/extension-drag-handle-react';
import { GripVertical } from 'lucide-react';
import type { Editor } from '@tiptap/react';

interface DragHandleProps {
  editor: Editor;
}

export function DragHandle({ editor }: DragHandleProps) {
  return (
    <DragHandleReact editor={editor}>
      <div
        className="flex items-center justify-center w-6 h-6 cursor-grab active:cursor-grabbing"
        aria-label="Drag to reorder block"
      >
        <GripVertical
          size={16}
          className="text-drag-handle hover:text-drag-handle-hover transition-colors duration-100"
        />
      </div>
    </DragHandleReact>
  );
}
