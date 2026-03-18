import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus } from 'lucide-react';
import type { Editor } from '@tiptap/react';

interface TableControlsProps {
  editor: Editor;
}

export function TableControls({ editor }: TableControlsProps) {
  const [tableRect, setTableRect] = useState<DOMRect | null>(null);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateTablePosition = useCallback(() => {
    if (!editor || !editor.isActive('table')) {
      setTableRect(null);
      setVisible(false);
      return;
    }

    // Find the table DOM element from the current selection
    const { $from } = editor.state.selection;
    let depth = $from.depth;
    while (depth > 0) {
      const node = $from.node(depth);
      if (node.type.name === 'table') {
        break;
      }
      depth--;
    }

    if (depth === 0) {
      setTableRect(null);
      setVisible(false);
      return;
    }

    const pos = $from.start(depth) - 1;
    const domNode = editor.view.nodeDOM(pos);
    if (!domNode || !(domNode instanceof HTMLElement)) {
      setTableRect(null);
      setVisible(false);
      return;
    }

    // The tableWrapper div wraps the actual table
    const tableEl =
      domNode.tagName === 'TABLE'
        ? domNode
        : domNode.querySelector('table') ?? domNode;

    const rect = tableEl.getBoundingClientRect();
    setTableRect(rect);
    setVisible(true);
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    editor.on('selectionUpdate', updateTablePosition);
    editor.on('transaction', updateTablePosition);

    return () => {
      editor.off('selectionUpdate', updateTablePosition);
      editor.off('transaction', updateTablePosition);
    };
  }, [editor, updateTablePosition]);

  const handleAddRow = useCallback(() => {
    editor.chain().focus().addRowAfter().run();
  }, [editor]);

  const handleAddColumn = useCallback(() => {
    editor.chain().focus().addColumnAfter().run();
  }, [editor]);

  if (!visible || !tableRect) {
    return null;
  }

  // Get the editor container for relative positioning
  const editorEl = editor.view.dom.closest('.ProseMirror');
  const editorRect = editorEl?.getBoundingClientRect();
  if (!editorRect) return null;

  const addRowTop = tableRect.bottom - editorRect.top + 4;
  const addRowLeft = tableRect.left - editorRect.left + tableRect.width / 2 - 10;

  const addColTop = tableRect.top - editorRect.top + tableRect.height / 2 - 10;
  const addColLeft = tableRect.right - editorRect.left + 4;

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
    >
      {/* Add Row button - centered below table */}
      <button
        type="button"
        aria-label="Add row"
        onClick={handleAddRow}
        style={{
          position: 'absolute',
          top: `${addRowTop}px`,
          left: `${addRowLeft}px`,
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: '#2F2F2F',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          pointerEvents: 'auto',
          padding: 0,
          transition: 'background 100ms ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = '#3A3A3A';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = '#2F2F2F';
        }}
      >
        <Plus size={12} style={{ color: 'rgba(255, 255, 255, 0.50)' }} />
      </button>

      {/* Add Column button - centered right of table */}
      <button
        type="button"
        aria-label="Add column"
        onClick={handleAddColumn}
        style={{
          position: 'absolute',
          top: `${addColTop}px`,
          left: `${addColLeft}px`,
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: '#2F2F2F',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          pointerEvents: 'auto',
          padding: 0,
          transition: 'background 100ms ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = '#3A3A3A';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = '#2F2F2F';
        }}
      >
        <Plus size={12} style={{ color: 'rgba(255, 255, 255, 0.50)' }} />
      </button>
    </div>
  );
}
