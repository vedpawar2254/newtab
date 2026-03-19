import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useNotesStore } from '../../lib/stores/notes-store';
import { useUIStore } from '../../lib/stores/ui-store';
import { storageService } from '../../lib/storage/storage-service';

interface SearchResult {
  id: string;
  title: string;
  snippet: string;
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const treeIndex = useNotesStore((s) => s.treeIndex);

  const search = useCallback(
    async (q: string) => {
      if (!q.trim() || !treeIndex) {
        setResults([]);
        return;
      }

      const lower = q.toLowerCase();
      const matched: SearchResult[] = [];

      for (const entry of treeIndex.entries) {
        const titleMatch = entry.title.toLowerCase().includes(lower);
        let snippet = '';

        if (!titleMatch) {
          // Search content
          try {
            const note = await storageService.loadNote(entry.id);
            if (note?.content) {
              const text = extractText(note.content);
              const idx = text.toLowerCase().indexOf(lower);
              if (idx >= 0) {
                const start = Math.max(0, idx - 30);
                const end = Math.min(text.length, idx + q.length + 30);
                snippet = (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '');
              } else {
                continue;
              }
            } else {
              continue;
            }
          } catch {
            continue;
          }
        }

        matched.push({
          id: entry.id,
          title: entry.title || 'Untitled',
          snippet: titleMatch ? '' : snippet,
        });

        if (matched.length >= 10) break;
      }

      setResults(matched);
    },
    [treeIndex],
  );

  useEffect(() => {
    const timeout = setTimeout(() => search(query), 150);
    return () => clearTimeout(timeout);
  }, [query, search]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(id: string) {
    useUIStore.getState().setActiveNote(id);
    useUIStore.getState().setActiveView('editor');
    setQuery('');
    setResults([]);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative px-[8px] pb-[8px]">
      <div className="flex items-center gap-[6px] bg-surface-elevated rounded-[6px] px-[8px] py-[6px] border border-border">
        <Search size={14} className="text-text-secondary shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.blur();
            }
          }}
          placeholder="Search notes..."
          className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-secondary/50 outline-none min-w-0"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="text-text-secondary hover:text-text-primary"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute left-[8px] right-[8px] top-full mt-[4px] bg-surface-elevated border border-border rounded-[6px] shadow-lg z-50 max-h-[300px] overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => handleSelect(r.id)}
              className="w-full text-left px-[10px] py-[8px] hover:bg-active-item-bg transition-colors duration-100 first:rounded-t-[6px] last:rounded-b-[6px]"
            >
              <div className="text-[13px] text-text-primary truncate">
                {r.title}
              </div>
              {r.snippet && (
                <div className="text-[11px] text-text-secondary truncate mt-[2px]">
                  {r.snippet}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {isOpen && query.trim() && results.length === 0 && (
        <div className="absolute left-[8px] right-[8px] top-full mt-[4px] bg-surface-elevated border border-border rounded-[6px] shadow-lg z-50 px-[10px] py-[12px] text-[12px] text-text-secondary text-center">
          No results found
        </div>
      )}
    </div>
  );
}

function extractText(contentJson: string): string {
  try {
    const doc = JSON.parse(contentJson);
    const parts: string[] = [];
    function walk(node: { type?: string; text?: string; content?: unknown[] }) {
      if (node.text) parts.push(node.text);
      if (Array.isArray(node.content)) {
        for (const child of node.content) walk(child);
      }
    }
    walk(doc);
    return parts.join(' ');
  } catch {
    return '';
  }
}
