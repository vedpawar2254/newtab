import type { TreeIndexEntry } from '../storage/types';

export interface FlattenedItem {
  id: string;
  parentId: string | null;
  depth: number;
  index: number;
  title: string;
  childCount: number;
  order: number;
}

/**
 * Returns total number of descendants (all levels) for a given parent.
 */
export function getDescendantCount(
  entries: TreeIndexEntry[],
  parentId: string,
): number {
  const children = entries.filter((e) => e.parentId === parentId);
  let count = children.length;
  for (const child of children) {
    count += getDescendantCount(entries, child.id);
  }
  return count;
}

/**
 * Recursively flattens tree entries into a flat array with depth info.
 * Each item includes its total descendant count (not just direct children).
 */
export function flattenTree(
  entries: TreeIndexEntry[],
  parentId: string | null = null,
  depth: number = 0,
): FlattenedItem[] {
  const result: FlattenedItem[] = [];
  const children = entries
    .filter((e) => e.parentId === parentId)
    .sort((a, b) => a.order - b.order);

  for (const entry of children) {
    const childCount = getDescendantCount(entries, entry.id);
    result.push({
      id: entry.id,
      parentId: entry.parentId,
      depth,
      index: 0, // will be set below
      title: entry.title,
      childCount,
      order: entry.order,
    });

    const nested = flattenTree(entries, entry.id, depth + 1);
    result.push(...nested);
  }

  // Set correct index values
  for (let i = 0; i < result.length; i++) {
    result[i].index = i;
  }

  return result;
}

/**
 * Removes all descendants of the given ids from the flattened list.
 * Used to hide children of collapsed items.
 */
export function removeChildrenOf(
  items: FlattenedItem[],
  ids: string[],
): FlattenedItem[] {
  const excludeSet = new Set(ids);
  const result: FlattenedItem[] = [];
  let skipUntilDepth: number | null = null;

  for (const item of items) {
    if (skipUntilDepth !== null && item.depth > skipUntilDepth) {
      continue;
    }
    skipUntilDepth = null;

    if (excludeSet.has(item.id)) {
      skipUntilDepth = item.depth;
    }

    result.push(item);
  }

  // Reindex
  for (let i = 0; i < result.length; i++) {
    result[i] = { ...result[i], index: i };
  }

  return result;
}

/**
 * Returns all descendant IDs (not including rootId). Recursive.
 */
export function collectSubtreeIds(
  entries: TreeIndexEntry[],
  rootId: string,
): string[] {
  const children = entries.filter((e) => e.parentId === rootId);
  const result: string[] = [];
  for (const child of children) {
    result.push(child.id);
    result.push(...collectSubtreeIds(entries, child.id));
  }
  return result;
}

/**
 * Returns a new entries array where all entries with the given parentId
 * have their order field reset to 0, 1, 2... based on their current relative order.
 */
export function reindexSiblings(
  entries: TreeIndexEntry[],
  parentId: string | null,
): TreeIndexEntry[] {
  const siblings = entries
    .filter((e) => e.parentId === parentId)
    .sort((a, b) => a.order - b.order);

  const orderMap = new Map<string, number>();
  siblings.forEach((s, i) => orderMap.set(s.id, i));

  return entries.map((e) => {
    const newOrder = orderMap.get(e.id);
    if (newOrder !== undefined) {
      return { ...e, order: newOrder };
    }
    return e;
  });
}
