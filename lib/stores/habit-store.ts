import { create } from 'zustand';
import { db } from '../storage/db';
import type { HabitRecord } from '../storage/types';

const toDateKey = (d: Date): string => d.toISOString().slice(0, 10);

interface HabitStoreState {
  habits: HabitRecord[];
  initialized: boolean;

  loadFromStorage: () => Promise<void>;
  persist: () => Promise<void>;
  addHabit: (name: string) => void;
  removeHabit: (id: string) => void;
  renameHabit: (id: string, name: string) => void;
  toggleToday: (id: string) => void;
  getStreak: (habit: HabitRecord) => number;
  getLast7Days: (habit: HabitRecord) => boolean[];
}

export const useHabitStore = create<HabitStoreState>((set, get) => ({
  habits: [],
  initialized: false,

  loadFromStorage: async () => {
    try {
      const record = await db.settings.get('habit-data');
      if (record) {
        const data = record.value as { habits: HabitRecord[] };
        set({ habits: data.habits, initialized: true });
      } else {
        set({ initialized: true });
      }
    } catch (err) {
      console.error('Failed to load habit data:', err);
      set({ initialized: true });
    }
  },

  persist: async () => {
    try {
      await db.settings.put({
        key: 'habit-data',
        value: { habits: get().habits, updatedAt: Date.now() },
      });
    } catch (err) {
      console.error('Failed to persist habit data:', err);
    }
  },

  addHabit: (name: string) => {
    const habit: HabitRecord = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
      completions: {},
    };
    set((s) => ({ habits: [...s.habits, habit] }));
    get().persist();
  },

  removeHabit: (id: string) => {
    set((s) => ({ habits: s.habits.filter((h) => h.id !== id) }));
    get().persist();
  },

  renameHabit: (id: string, name: string) => {
    set((s) => ({
      habits: s.habits.map((h) => (h.id === id ? { ...h, name } : h)),
    }));
    get().persist();
  },

  toggleToday: (id: string) => {
    const dateKey = toDateKey(new Date());
    set((s) => ({
      habits: s.habits.map((h) => {
        if (h.id !== id) return h;
        const completions = { ...h.completions };
        completions[dateKey] = !completions[dateKey];
        return { ...h, completions };
      }),
    }));
    get().persist();
  },

  getStreak: (habit: HabitRecord): number => {
    let streak = 0;
    const date = new Date();
    date.setDate(date.getDate() - 1); // start from yesterday

    while (true) {
      const key = toDateKey(date);
      if (!habit.completions[key]) break;
      streak++;
      date.setDate(date.getDate() - 1);
    }
    return streak;
  },

  getLast7Days: (habit: HabitRecord): boolean[] => {
    const result: boolean[] = [];
    const date = new Date();
    date.setDate(date.getDate() - 6); // start from 6 days ago

    for (let i = 0; i < 7; i++) {
      const key = toDateKey(date);
      result.push(!!habit.completions[key]);
      date.setDate(date.getDate() + 1);
    }
    return result;
  },
}));
