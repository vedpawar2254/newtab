import { create } from 'zustand';
import type { WidgetSectionId } from '../storage/types';

interface WidgetStoreState {
  collapsedSections: Set<WidgetSectionId>;
  toggleSection: (id: WidgetSectionId) => void;
  isSectionCollapsed: (id: WidgetSectionId) => boolean;
}

export const useWidgetStore = create<WidgetStoreState>((set, get) => ({
  collapsedSections: new Set<WidgetSectionId>(),

  toggleSection: (id: WidgetSectionId) => {
    set((s) => {
      const next = new Set(s.collapsedSections);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { collapsedSections: next };
    });
  },

  isSectionCollapsed: (id: WidgetSectionId) => {
    return get().collapsedSections.has(id);
  },
}));
