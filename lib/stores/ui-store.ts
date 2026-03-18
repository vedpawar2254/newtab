import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  activeNoteId: string | null;
  isLoading: boolean;
  collapsedIds: Set<string>;
  renamingId: string | null;
  activeView: 'editor' | 'whiteboard';
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveNote: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  toggleCollapsed: (id: string) => void;
  setRenamingId: (id: string | null) => void;
  setActiveView: (view: 'editor' | 'whiteboard') => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeNoteId: null,
  isLoading: true,
  collapsedIds: new Set<string>(),
  renamingId: null,
  activeView: 'editor',
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
}));
