import { create } from 'zustand';
import { db } from '../storage/db';
import type { QuickLink } from '../storage/types';

const SETTINGS_KEY = 'quick-links';

interface LinksStore {
  links: QuickLink[];
  initialized: boolean;
  initialize: () => Promise<void>;
  addLink: (title: string, url: string) => Promise<void>;
  removeLink: (id: string) => Promise<void>;
}

export const useLinksStore = create<LinksStore>((set, get) => ({
  links: [],
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;
    try {
      const record = await db.settings.get(SETTINGS_KEY);
      if (record?.value) {
        set({ links: record.value as QuickLink[], initialized: true });
      } else {
        set({ initialized: true });
      }
    } catch {
      set({ initialized: true });
    }
  },

  addLink: async (title: string, url: string) => {
    const link: QuickLink = {
      id: crypto.randomUUID(),
      title: title || new URL(url).hostname,
      url,
      order: get().links.length,
      createdAt: Date.now(),
    };
    const updated = [...get().links, link];
    set({ links: updated });
    await db.settings.put({ key: SETTINGS_KEY, value: updated });
  },

  removeLink: async (id: string) => {
    const updated = get().links.filter((l) => l.id !== id);
    set({ links: updated });
    await db.settings.put({ key: SETTINGS_KEY, value: updated });
  },
}));
