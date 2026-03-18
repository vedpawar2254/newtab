import { useEffect, useMemo, useState } from 'react';
import { Command } from 'cmdk';
import {
  Search,
  FileText,
  Plus,
  PanelLeft,
  Maximize,
  CheckSquare,
  SearchX,
} from 'lucide-react';
import { useUIStore } from '../../lib/stores/ui-store';
import { useNotesStore } from '../../lib/stores/notes-store';
import { searchNotes, buildSearchIndex } from '../../lib/search/search-index';
import type { SearchResult } from '../../lib/search/search-index';
import { CommandPaletteItem } from './CommandPaletteItem';
import { SearchResultItem } from './SearchResultItem';

const platform = typeof navigator !== 'undefined' && navigator.platform.includes('Mac') ? 'mac' : 'other';

interface StaticCommand {
  icon: typeof Plus;
  label: string;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette() {
  const commandPaletteOpen = useUIStore((s) => s.commandPaletteOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const recentPageIds = useUIStore((s) => s.recentPageIds);
  const setActiveNote = useUIStore((s) => s.setActiveNote);
  const addRecentPage = useUIStore((s) => s.addRecentPage);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const toggleFocusMode = useUIStore((s) => s.toggleFocusMode);
  const toggleTodoPanel = useUIStore((s) => s.toggleTodoPanel);

  const treeIndex = useNotesStore((s) => s.treeIndex);
  const noteCache = useNotesStore((s) => s.noteCache);
  const createNote = useNotesStore((s) => s.createNote);

  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Build search index when palette opens
  useEffect(() => {
    if (commandPaletteOpen && treeIndex) {
      buildSearchIndex(treeIndex.entries, noteCache);
    }
  }, [commandPaletteOpen, treeIndex, noteCache]);

  // Reset search when palette closes
  useEffect(() => {
    if (!commandPaletteOpen) {
      setSearchValue('');
      setSearchResults([]);
    }
  }, [commandPaletteOpen]);

  // Perform search on input change
  useEffect(() => {
    if (searchValue.trim().length > 0) {
      const results = searchNotes(searchValue);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchValue]);

  const commands: StaticCommand[] = useMemo(() => [
    {
      icon: Plus,
      label: 'New Page',
      action: async () => {
        const note = await createNote('');
        setActiveNote(note.id);
        setCommandPaletteOpen(false);
      },
    },
    {
      icon: PanelLeft,
      label: 'Toggle Sidebar',
      shortcut: platform === 'mac' ? 'Cmd+\\' : 'Ctrl+\\',
      action: () => {
        toggleSidebar();
        setCommandPaletteOpen(false);
      },
    },
    {
      icon: Maximize,
      label: 'Toggle Focus Mode',
      shortcut: platform === 'mac' ? 'Cmd+.' : 'Ctrl+.',
      action: () => {
        toggleFocusMode();
        setCommandPaletteOpen(false);
      },
    },
    {
      icon: CheckSquare,
      label: 'Toggle Todo Panel',
      action: () => {
        toggleTodoPanel();
        setCommandPaletteOpen(false);
      },
    },
  ], [createNote, setActiveNote, setCommandPaletteOpen, toggleSidebar, toggleFocusMode, toggleTodoPanel]);

  // Resolve recent page titles from tree index
  const recentPages = useMemo(() => {
    if (!treeIndex) return [];
    return recentPageIds
      .map((id) => {
        const entry = treeIndex.entries.find((e) => e.id === id);
        return entry ? { id: entry.id, title: entry.title } : null;
      })
      .filter((p): p is { id: string; title: string } => p !== null);
  }, [recentPageIds, treeIndex]);

  const handlePageSelect = (id: string) => {
    setActiveNote(id);
    addRecentPage(id);
    setCommandPaletteOpen(false);
  };

  if (!commandPaletteOpen) return null;

  const hasQuery = searchValue.trim().length > 0;
  const noResults = hasQuery && searchResults.length === 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-backdrop animate-[fade-in_150ms_ease-out]"
        onClick={() => setCommandPaletteOpen(false)}
      />

      {/* Dialog container */}
      <div className="fixed z-50 top-[20%] left-1/2 -translate-x-1/2 w-[560px] max-h-[420px] bg-surface border border-border-strong rounded-[12px] shadow-[0_16px_48px_rgba(0,0,0,0.40)] overflow-hidden">
        <Command shouldFilter={false}>
          {/* Search input */}
          <div className="flex items-center h-[48px] bg-bg border-b border-border px-[16px] gap-[8px]">
            <Search size={16} className="text-text-secondary shrink-0" />
            <Command.Input
              value={searchValue}
              onValueChange={setSearchValue}
              placeholder="Search pages and commands..."
              className="flex-1 bg-transparent text-[14px] text-text-primary placeholder:text-text-secondary caret-accent outline-none border-none"
              autoFocus
            />
          </div>

          {/* Result list */}
          <Command.List className="max-h-[372px] overflow-y-auto p-[8px] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:bg-border-strong [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            {noResults && (
              <div className="flex flex-col items-center justify-center py-[32px] gap-[8px]">
                <SearchX size={32} className="text-accent/30" />
                <p className="text-[14px] text-text-secondary">No results found</p>
                <p className="text-[12px] text-text-secondary">
                  Try different words, or press Esc and create a new page.
                </p>
              </div>
            )}

            {/* Search results mode */}
            {hasQuery && searchResults.length > 0 && (
              <Command.Group heading="Pages" className="[&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.05em] [&_[cmdk-group-heading]]:text-text-secondary [&_[cmdk-group-heading]]:px-[8px] [&_[cmdk-group-heading]]:pt-[8px] [&_[cmdk-group-heading]]:pb-[4px] [&_[cmdk-group-heading]]:sticky [&_[cmdk-group-heading]]:top-0 [&_[cmdk-group-heading]]:bg-surface">
                {searchResults.map((result) => (
                  <SearchResultItem
                    key={result.id}
                    title={result.title}
                    snippet={result.snippet}
                    query={searchValue}
                    onSelect={() => handlePageSelect(result.id)}
                  />
                ))}
              </Command.Group>
            )}

            {/* Commands group (always shown, filtered when searching) */}
            {!noResults && (
              <Command.Group heading="Commands" className="[&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.05em] [&_[cmdk-group-heading]]:text-text-secondary [&_[cmdk-group-heading]]:px-[8px] [&_[cmdk-group-heading]]:pt-[8px] [&_[cmdk-group-heading]]:pb-[4px] [&_[cmdk-group-heading]]:sticky [&_[cmdk-group-heading]]:top-0 [&_[cmdk-group-heading]]:bg-surface">
                {commands
                  .filter((cmd) =>
                    !hasQuery || cmd.label.toLowerCase().includes(searchValue.toLowerCase())
                  )
                  .map((cmd) => (
                    <CommandPaletteItem
                      key={cmd.label}
                      icon={cmd.icon}
                      label={cmd.label}
                      shortcut={cmd.shortcut}
                      onSelect={cmd.action}
                    />
                  ))}
              </Command.Group>
            )}

            {/* Recent pages (only when input is empty) */}
            {!hasQuery && recentPages.length > 0 && (
              <Command.Group heading="Recent" className="[&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.05em] [&_[cmdk-group-heading]]:text-text-secondary [&_[cmdk-group-heading]]:px-[8px] [&_[cmdk-group-heading]]:pt-[8px] [&_[cmdk-group-heading]]:pb-[4px] [&_[cmdk-group-heading]]:sticky [&_[cmdk-group-heading]]:top-0 [&_[cmdk-group-heading]]:bg-surface">
                {recentPages.map((page) => (
                  <CommandPaletteItem
                    key={page.id}
                    icon={FileText}
                    label={page.title || 'Untitled'}
                    onSelect={() => handlePageSelect(page.id)}
                  />
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </>
  );
}
