import { create } from 'zustand';
import { db } from '../storage/db';

interface UIState {
  sidebarOpen: boolean;
  activeNoteId: string | null;
  isLoading: boolean;
  collapsedIds: Set<string>;
  renamingId: string | null;
  activeView: 'editor' | 'whiteboard' | 'kanban';
  todoPanelOpen: boolean;
  focusMode: boolean;
  commandPaletteOpen: boolean;
  recentPageIds: string[];
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveNote: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  toggleCollapsed: (id: string) => void;
  setRenamingId: (id: string | null) => void;
  setActiveView: (view: 'editor' | 'whiteboard' | 'kanban') => void;
  toggleTodoPanel: () => void;
  setTodoPanelOpen: (open: boolean) => void;
  loadTodoPanelState: () => Promise<void>;
  setFocusMode: (on: boolean) => void;
  toggleFocusMode: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  addRecentPage: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: true,
  activeNoteId: null,
  isLoading: true,
  collapsedIds: new Set<string>(),
  renamingId: null,
  activeView: 'editor',
  todoPanelOpen: false,
  focusMode: false,
  commandPaletteOpen: false,
  recentPageIds: [],
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveNote: (id) => set({ activeNoteId: id }),
  setLoading: (loading) => set({ isLoading: loading }),
  toggleCollapsed: (id) =>
    set((s) => {
      const next = new Set(s.collapsedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { collapsedIds: next };
    }),
  setRenamingId: (id) => set({ renamingId: id }),
  setActiveView: (view) => set({ activeView: view }),
  toggleTodoPanel: () => {
    const open = !get().todoPanelOpen;
    set({ todoPanelOpen: open });
    db.settings.put({ key: 'todo-panel-open', value: open });
  },
  setTodoPanelOpen: (open) => {
    set({ todoPanelOpen: open });
    db.settings.put({ key: 'todo-panel-open', value: open });
  },
  setFocusMode: (on) => set({ focusMode: on }),
  toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  addRecentPage: (id) => set((s) => ({ recentPageIds: [id, ...s.recentPageIds.filter(p => p !== id)].slice(0, 5) })),
  loadTodoPanelState: async () => {
    try {
      const record = await db.settings.get('todo-panel-open');
      if (record) set({ todoPanelOpen: record.value as boolean });
    } catch (err) {
      console.error('Failed to load todo panel state:', err);
    }
  },
}));
