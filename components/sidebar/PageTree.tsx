import { useMemo, useRef, useState } from 'react';
import { FileText } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragMoveEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useNotesStore } from '../../lib/stores/notes-store';
import { useUIStore } from '../../lib/stores/ui-store';
import {
  flattenTree,
  removeChildrenOf,
  type FlattenedItem,
} from '../../lib/utils/tree-utils';
import { PageTreeItem } from './PageTreeItem';

const INDENTATION_WIDTH = 16;

function getProjection(
  items: FlattenedItem[],
  activeId: string,
  overId: string,
  dragOffset: number,
): { depth: number; parentId: string | null } {
  const overIndex = items.findIndex((i) => i.id === overId);
  const activeIndex = items.findIndex((i) => i.id === activeId);
  const activeItem = items[activeIndex];
  const newItems = arrayMove(items, activeIndex, overIndex);
  const previousItem = newItems[overIndex - 1];

  const projectedDepth =
    activeItem.depth + Math.round(dragOffset / INDENTATION_WIDTH);
  const maxDepth = previousItem ? previousItem.depth + 1 : 0;
  const minDepth = newItems[overIndex + 1]?.depth ?? 0;
  const depth = Math.min(Math.max(projectedDepth, minDepth), maxDepth);

  function getParentId(): string | null {
    if (depth === 0) return null;
    for (let i = overIndex - 1; i >= 0; i--) {
      if (newItems[i].depth === depth - 1) return newItems[i].id;
    }
    return null;
  }

  return { depth, parentId: getParentId() };
}

function DragOverlayContent({
  activeId,
  items,
}: {
  activeId: string;
  items: FlattenedItem[];
}) {
  const item = items.find((i) => i.id === activeId);
  if (!item) return null;

  return (
    <div className="bg-drag-ghost-bg border border-border-strong rounded-[4px] px-[12px] py-[4px] text-[14px] font-normal text-text-primary whitespace-nowrap">
      {item.title || 'Untitled'}
      {item.childCount > 0 && (
        <span className="text-text-secondary"> (+{item.childCount})</span>
      )}
    </div>
  );
}

export function PageTree() {
  const treeIndex = useNotesStore((s) => s.treeIndex);
  const moveNote = useNotesStore((s) => s.moveNote);
  const collapsedIds = useUIStore((s) => s.collapsedIds);
  const activeNoteId = useUIStore((s) => s.activeNoteId);
  const renamingId = useUIStore((s) => s.renamingId);
  const toggleCollapsed = useUIStore((s) => s.toggleCollapsed);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const expandTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(KeyboardSensor),
  );

  const flattenedItems = useMemo(() => {
    if (!treeIndex) return [];
    const flat = flattenTree(treeIndex.entries);
    const collapsedAndDragging = [
      ...collapsedIds,
      ...(activeId ? [activeId] : []),
    ];
    return removeChildrenOf(flat, collapsedAndDragging);
  }, [treeIndex, collapsedIds, activeId]);

  const sortedIds = useMemo(
    () => flattenedItems.map((i) => i.id),
    [flattenedItems],
  );

  const projected =
    activeId && overId
      ? getProjection(flattenedItems, activeId, overId, offsetLeft)
      : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
    setOverId(event.active.id as string);
    setOffsetLeft(0);
  }

  function handleDragMove(event: DragMoveEvent) {
    setOffsetLeft(event.delta.x);
  }

  function handleDragOver(event: DragOverEvent) {
    setOverId((event.over?.id as string) ?? null);

    if (expandTimeoutRef.current) clearTimeout(expandTimeoutRef.current);
    const overItemId = event.over?.id as string;
    if (overItemId && collapsedIds.has(overItemId)) {
      expandTimeoutRef.current = setTimeout(() => {
        toggleCollapsed(overItemId);
      }, 500);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    if (expandTimeoutRef.current) clearTimeout(expandTimeoutRef.current);

    if (!projected || !activeId || !treeIndex) {
      resetDragState();
      return;
    }

    const activeItem = flattenedItems.find((i) => i.id === activeId);
    if (!activeItem) {
      resetDragState();
      return;
    }

    // Calculate new order among siblings at target level
    const overIndex = flattenedItems.findIndex((i) => i.id === overId);
    const clonedItems = arrayMove(
      flattenedItems,
      flattenedItems.findIndex((i) => i.id === activeId),
      overIndex,
    );

    // Count how many items before this one share the same projected parentId
    let newOrder = 0;
    for (const item of clonedItems) {
      if (item.id === activeId) break;
      if (item.parentId === projected.parentId && item.id !== activeId) {
        newOrder++;
      }
    }

    const parentChanged = activeItem.parentId !== projected.parentId;
    const orderChanged = activeItem.order !== newOrder;

    if (parentChanged || orderChanged) {
      moveNote(activeId, projected.parentId, newOrder);
    }

    resetDragState();
  }

  function handleDragCancel() {
    if (expandTimeoutRef.current) clearTimeout(expandTimeoutRef.current);
    resetDragState();
  }

  function resetDragState() {
    setActiveId(null);
    setOverId(null);
    setOffsetLeft(0);
  }

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
        <div role="tree" aria-label="Page tree" className="flex flex-col">
          {flattenedItems.map((item) => (
            <PageTreeItem
              key={item.id}
              id={item.id}
              title={item.title}
              depth={
                item.id === activeId && projected
                  ? projected.depth
                  : item.depth
              }
              childCount={item.childCount}
              isActive={item.id === activeNoteId}
              isCollapsed={collapsedIds.has(item.id)}
              isRenaming={item.id === renamingId}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay dropAnimation={null}>
        {activeId ? (
          <DragOverlayContent activeId={activeId} items={flattenedItems} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
