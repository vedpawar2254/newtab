import { create } from 'zustand';
import { db } from '../storage/db';

export type SidebarWidgetId = 'pomodoro' | 'habits' | 'journal' | 'whiteboard' | 'kanban' | 'quicklinks';

const ALL_WIDGETS: SidebarWidgetId[] = ['pomodoro', 'habits', 'journal', 'whiteboard', 'kanban', 'quicklinks'];

interface SidebarWidgetsState {
  enabledWidgets: Set<SidebarWidgetId>;
  toggleWidget: (id: SidebarWidgetId) => void;
  loadFromStorage: () => Promise<void>;
}

export const useSidebarWidgets = create<SidebarWidgetsState>((set, get) => ({
  enabledWidgets: new Set<SidebarWidgetId>(ALL_WIDGETS),

  toggleWidget: (id: SidebarWidgetId) => {
    const next = new Set(get().enabledWidgets);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    set({ enabledWidgets: next });
    db.settings.put({ key: 'sidebar-widgets', value: [...next] });
  },

  loadFromStorage: async () => {
    try {
      const record = await db.settings.get('sidebar-widgets');
      if (record) {
        const arr = record.value as SidebarWidgetId[];
        set({ enabledWidgets: new Set(arr) });
      }
    } catch (err) {
      console.error('Failed to load sidebar widgets state:', err);
    }
  },
}));
