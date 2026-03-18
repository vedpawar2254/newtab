import { create } from 'zustand';
import { db } from '../storage/db';
import { notifySessionComplete } from '../utils/pomodoro-notifications';

interface PomodoroStoreState {
  workDuration: number;
  breakDuration: number;
  sessionsCompleted: number;
  isRunning: boolean;
  isBreak: boolean;
  timeRemaining: number;
  intervalId: ReturnType<typeof setInterval> | null;

  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  setWorkDuration: (mins: number) => void;
  setBreakDuration: (mins: number) => void;
  onSessionComplete: () => void;
  loadFromStorage: () => Promise<void>;
  persist: () => Promise<void>;
}

export const usePomodoroStore = create<PomodoroStoreState>((set, get) => ({
  workDuration: 25,
  breakDuration: 5,
  sessionsCompleted: 0,
  isRunning: false,
  isBreak: false,
  timeRemaining: 25 * 60,
  intervalId: null,

  start: () => {
    const { intervalId } = get();
    if (intervalId) return;
    const id = setInterval(() => get().tick(), 1000);
    set({ isRunning: true, intervalId: id });
  },

  pause: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({ isRunning: false, intervalId: null });
  },

  reset: () => {
    const { intervalId, workDuration } = get();
    if (intervalId) clearInterval(intervalId);
    set({
      isRunning: false,
      isBreak: false,
      timeRemaining: workDuration * 60,
      intervalId: null,
    });
  },

  tick: () => {
    const { timeRemaining } = get();
    if (timeRemaining <= 1) {
      get().onSessionComplete();
    } else {
      set({ timeRemaining: timeRemaining - 1 });
    }
  },

  onSessionComplete: () => {
    const { isBreak, sessionsCompleted, breakDuration, workDuration, intervalId } = get();
    const wasBreak = isBreak;
    if (intervalId) clearInterval(intervalId);

    if (!isBreak) {
      set({
        sessionsCompleted: sessionsCompleted + 1,
        isBreak: true,
        timeRemaining: breakDuration * 60,
        isRunning: false,
        intervalId: null,
      });
    } else {
      set({
        isBreak: false,
        timeRemaining: workDuration * 60,
        isRunning: false,
        intervalId: null,
      });
    }
    get().persist();
    notifySessionComplete(wasBreak);
  },

  setWorkDuration: (mins: number) => {
    const clamped = Math.max(1, Math.min(120, mins));
    const { isRunning, isBreak } = get();
    set({ workDuration: clamped });
    if (!isRunning && !isBreak) {
      set({ timeRemaining: clamped * 60 });
    }
    get().persist();
  },

  setBreakDuration: (mins: number) => {
    const clamped = Math.max(1, Math.min(120, mins));
    const { isRunning, isBreak } = get();
    set({ breakDuration: clamped });
    if (!isRunning && isBreak) {
      set({ timeRemaining: clamped * 60 });
    }
    get().persist();
  },

  loadFromStorage: async () => {
    try {
      const record = await db.settings.get('pomodoro-state');
      if (record) {
        const data = record.value as {
          workDuration: number;
          breakDuration: number;
          sessionsCompleted: number;
        };
        set({
          workDuration: data.workDuration,
          breakDuration: data.breakDuration,
          sessionsCompleted: data.sessionsCompleted,
          timeRemaining: data.workDuration * 60,
        });
      }
    } catch (err) {
      console.error('Failed to load pomodoro state:', err);
    }
  },

  persist: async () => {
    try {
      const { workDuration, breakDuration, sessionsCompleted } = get();
      await db.settings.put({
        key: 'pomodoro-state',
        value: { workDuration, breakDuration, sessionsCompleted, updatedAt: Date.now() },
      });
    } catch (err) {
      console.error('Failed to persist pomodoro state:', err);
    }
  },
}));
