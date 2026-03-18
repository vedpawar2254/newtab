import { useMemo } from 'react';
import { FileText } from 'lucide-react';
import { useNotesStore } from '../../lib/stores/notes-store';
import { useUIStore } from '../../lib/stores/ui-store';
import { flattenTree, removeChildrenOf } from '../../lib/utils/tree-utils';
import { PageTreeItem } from './PageTreeItem';

export function PageTree() {
  const treeIndex = useNotesStore((s) => s.treeIndex);
  const collapsedIds = useUIStore((s) => s.collapsedIds);
  const activeNoteId = useUIStore((s) => s.activeNoteId);
  const renamingId = useUIStore((s) => s.renamingId);

  const flattenedItems = useMemo(() => {
    if (!treeIndex) return [];
    const flat = flattenTree(treeIndex.entries);
    return removeChildrenOf(flat, [...collapsedIds]);
  }, [treeIndex, collapsedIds]);

  // Empty state
  if (treeIndex && flattenedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-[8px] py-[32px]">
        <FileText size={32} className="text-white/15" />
        <p className="text-[14px] text-text-secondary">No pages yet</p>
        <p className="text-[12px] text-text-secondary">
          Click + New Page to get started.
        </p>
      </div>
    );
  }

  return (
    <div role="tree" className="flex flex-col">
      {flattenedItems.map((item) => (
        <PageTreeItem
          key={item.id}
          id={item.id}
          title={item.title}
          depth={item.depth}
          childCount={item.childCount}
          isActive={item.id === activeNoteId}
          isCollapsed={collapsedIds.has(item.id)}
          isRenaming={item.id === renamingId}
        />
      ))}
    </div>
  );
}
