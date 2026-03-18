export interface NoteRecord {
  id: string;
  title: string;
  content: string; // JSON string (editor content in Phase 2+, empty string in Phase 1)
  parentId: string | null;
  order: number;
  createdAt: number;
  updatedAt: number;
  schemaVersion: number;
}

export interface TreeIndexEntry {
  id: string;
  title: string;
  parentId: string | null;
  childIds: string[];
  order: number;
  path: string[];  // breadcrumb path of parent IDs
}

export interface TreeIndex {
  entries: TreeIndexEntry[];
  updatedAt: number;
}

export interface SettingsRecord {
  key: string;
  value: unknown;
}

export interface StorageUsage {
  used: number;
  quota: number;
  percent: number;
}

export interface HabitRecord {
  id: string;
  name: string;
  createdAt: number; // Date.now() timestamp
  completions: Record<string, boolean>; // key = "YYYY-MM-DD", value = completed
}

export interface HabitData {
  habits: HabitRecord[];
  updatedAt: number;
}

export interface PomodoroState {
  workDuration: number;   // minutes, default 25
  breakDuration: number;  // minutes, default 5
  sessionsCompleted: number;
  isRunning: boolean;
  isBreak: boolean;
  timeRemaining: number;  // seconds
  updatedAt: number;
}

export type WidgetSectionId = 'pomodoro' | 'habits' | 'journal';
