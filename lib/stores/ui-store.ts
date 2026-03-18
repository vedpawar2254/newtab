import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  activeNoteId: string | null;
  isLoading: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveNote: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeNoteId: null,
  isLoading: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveNote: (id) => set({ activeNoteId: id }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
