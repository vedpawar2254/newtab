import { useState } from 'react';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useNotesStore } from '../../lib/stores/notes-store';
import { useUIStore } from '../../lib/stores/ui-store';
import type { TreeIndex } from '../../lib/storage/types';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

interface MoreMenuProps {
  pageId: string;
  childCount: number;
}

function getNextActivePageId(
  pageId: string,
  treeIndex: TreeIndex,
  activeNoteId: string | null,
): string | null {
  if (activeNoteId !== pageId) return activeNoteId;

  const entry = treeIndex.entries.find((e) => e.id === pageId);
  if (!entry) return null;

  const siblings = treeIndex.entries
    .filter((e) => e.parentId === entry.parentId)
    .sort((a, b) => a.order - b.order);

  const idx = siblings.findIndex((s) => s.id === pageId);

  // Next sibling below
  if (idx < siblings.length - 1) return siblings[idx + 1].id;
  // Previous sibling above
  if (idx > 0) return siblings[idx - 1].id;
  // Parent
  if (entry.parentId) return entry.parentId;
  // Nothing left
  return null;
}

export function MoreMenu({ pageId, childCount }: MoreMenuProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const pageName =
    useNotesStore.getState().treeIndex?.entries.find((e) => e.id === pageId)
      ?.title ?? 'Untitled';

  async function handleDelete() {
    const notesStore = useNotesStore.getState();
    const uiStore = useUIStore.getState();
    const nextId = getNextActivePageId(
      pageId,
      notesStore.treeIndex!,
      uiStore.activeNoteId,
    );
    await notesStore.cascadeDelete(pageId);
    if (uiStore.activeNoteId === pageId) {
      uiStore.setActiveNote(nextId);
    }
  }

  function handleDeleteClick() {
    if (childCount === 0) {
      handleDelete();
    } else {
      setShowDeleteDialog(true);
    }
  }

  function handleConfirmDelete() {
    setShowDeleteDialog(false);
    handleDelete();
  }

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            aria-label="More actions"
            className="w-[20px] h-[20px] flex items-center justify-center rounded hover:bg-white/10 cursor-pointer"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal size={14} className="text-white/40" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            side="bottom"
            align="end"
            sideOffset={4}
            className="min-w-[160px] bg-surface border border-border-strong rounded-[6px] py-[4px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 z-50"
          >
            <DropdownMenu.Item
              onClick={handleDeleteClick}
              className="flex items-center h-[32px] px-[12px] gap-[8px] text-[14px] font-normal text-destructive hover:bg-surface-elevated cursor-pointer outline-none"
            >
              <Trash2 size={14} />
              Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        pageName={pageName}
        childCount={childCount}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
