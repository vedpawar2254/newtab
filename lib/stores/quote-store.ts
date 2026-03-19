import { create } from 'zustand';
import { db } from '../storage/db';
import type { Quote } from '../data/quotes';

interface QuoteStoreState {
  customQuotes: Quote[];
  addQuote: (text: string, author: string) => void;
  removeQuote: (index: number) => void;
  loadFromStorage: () => Promise<void>;
}

export const useQuoteStore = create<QuoteStoreState>((set, get) => ({
  customQuotes: [],

  addQuote: (text: string, author: string) => {
    const next = [...get().customQuotes, { text, author }];
    set({ customQuotes: next });
    db.settings.put({ key: 'custom-quotes', value: next });
  },

  removeQuote: (index: number) => {
    const next = get().customQuotes.filter((_, i) => i !== index);
    set({ customQuotes: next });
    db.settings.put({ key: 'custom-quotes', value: next });
  },

  loadFromStorage: async () => {
    try {
      const record = await db.settings.get('custom-quotes');
      if (record) {
        set({ customQuotes: record.value as Quote[] });
      }
    } catch (err) {
      console.error('Failed to load custom quotes:', err);
    }
  },
}));
