import FlexSearch from 'flexsearch';
import type { TreeIndexEntry, NoteRecord } from '../storage/types';

export interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  matchField: 'title' | 'body';
}

interface IndexDoc {
  id: string;
  title: string;
  body: string;
}

const index = new FlexSearch.Document<IndexDoc>({
  document: {
    id: 'id',
    index: ['title', 'body'],
  },
  tokenize: 'forward',
  resolution: 9,
  cache: true,
});

// Keep a local map of doc bodies for snippet generation
const bodyMap = new Map<string, string>();
const titleMap = new Map<string, string>();

function stripHtml(content: string): string {
  return content.replace(/<[^>]+>/g, '');
}

export function buildSearchIndex(
  entries: TreeIndexEntry[],
  noteCache: Map<string, NoteRecord>,
): void {
  for (const entry of entries) {
    const note = noteCache.get(entry.id);
    const body = note ? stripHtml(note.content) : '';
    const doc = { id: entry.id, title: entry.title, body };
    index.add(doc);
    bodyMap.set(entry.id, body);
    titleMap.set(entry.id, entry.title);
  }
}

export function updateSearchIndex(
  id: string,
  title: string,
  content: string,
): void {
  index.remove(id);
  const body = stripHtml(content);
  index.add({ id, title, body });
  bodyMap.set(id, body);
  titleMap.set(id, title);
}

export function removeFromSearchIndex(id: string): void {
  index.remove(id);
  bodyMap.delete(id);
  titleMap.delete(id);
}

export function getSnippet(
  body: string,
  query: string,
  maxLen: number = 80,
): string {
  if (!body || !query) return '';
  const lowerBody = body.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIdx = lowerBody.indexOf(lowerQuery);
  if (matchIdx === -1) return body.slice(0, maxLen) + (body.length > maxLen ? '...' : '');

  const halfWindow = Math.floor((maxLen - query.length) / 2);
  let start = Math.max(0, matchIdx - halfWindow);
  let end = Math.min(body.length, start + maxLen);

  if (end - start < maxLen) {
    start = Math.max(0, end - maxLen);
  }

  let snippet = body.slice(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < body.length) snippet = snippet + '...';
  return snippet;
}

export function searchNotes(query: string): SearchResult[] {
  if (!query.trim()) return [];

  const rawResults = index.search(query, { limit: 10 });
  const seen = new Set<string>();
  const results: SearchResult[] = [];

  for (const fieldResult of rawResults) {
    const field = fieldResult.field as 'title' | 'body';
    for (const id of fieldResult.result) {
      const strId = String(id);
      if (seen.has(strId)) continue;
      seen.add(strId);

      const title = titleMap.get(strId) || '';
      const body = bodyMap.get(strId) || '';
      const snippet = field === 'body' ? getSnippet(body, query) : '';

      results.push({
        id: strId,
        title,
        snippet,
        matchField: field,
      });
    }
  }

  return results;
}
