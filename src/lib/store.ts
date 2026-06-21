'use client';

import { UserState, Roadmap, Task, Badge } from './types';

const STORAGE_KEY = 'pathmate-state';

const defaultState: UserState = {
  name: '',
  goal: '',
  currentLevel: 'beginner',
  hoursPerDay: 4,
  deadline: '',
  commitments: [],
  darkMode: false,
  notifications: true,
  onboardingComplete: false,
  roadmap: null,
  taskHistory: {},
  burnoutDismissedAt: null,
};

function loadState(): UserState {
  if (typeof window === 'undefined') return { ...defaultState };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { ...defaultState };
}

function saveState(state: UserState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getState(): UserState {
  return loadState();
}

export function updateState(partial: Partial<UserState>): UserState {
  const state = loadState();
  const updated = { ...state, ...partial };
  saveState(updated);
  return updated;
}

export function toggleTask(taskId: string, date: string): UserState {
  const state = loadState();
  const key = `${date}_${taskId}`;
  const current = state.taskHistory[key] ?? false;
  state.taskHistory[key] = !current;

  if (state.roadmap) {
    state.roadmap = {
      ...state.roadmap,
      days: state.roadmap.days.map(day =>
        day.date === date
          ? {
              ...day,
              tasks: day.tasks.map(t =>
                t.id === taskId ? { ...t, completed: !current } : t
              ),
              completed: day.tasks.every(t =>
                t.id === taskId ? !current : t.completed
              ),
            }
          : day
      ),
    };
  }

  saveState(state);
  return state;
}

export function addCustomTask(
  title: string,
  estimatedTime: number,
  category: Task['category'],
  date: string
): UserState {
  const state = loadState();
  if (!state.roadmap) return state;

  const day = state.roadmap.days.find(d => d.date === date);
  if (!day) return state;

  const newTask: Task = {
    id: `custom_${Date.now()}`,
    title,
    estimatedTime,
    category,
    completed: false,
    date,
    day: day.day,
    phaseId: day.phaseId,
  };

  state.roadmap = {
    ...state.roadmap,
    days: state.roadmap.days.map(d =>
      d.date === date ? { ...d, tasks: [...d.tasks, newTask] } : d
    ),
  };

  saveState(state);
  return state;
}

export function reGenerateRoadmap(newRoadmap: Roadmap): UserState {
  return updateState({ roadmap: newRoadmap });
}

export function getBadges(state: UserState): Badge[] {
  const badges: Badge[] = [
    {
      id: 'first_task',
      title: 'First Step',
      description: 'Complete your first task',
      icon: '🎯',
      unlocked: false,
    },
    {
      id: 'three_streak',
      title: 'On a Roll',
      description: '3-day streak',
      icon: '🔥',
      unlocked: false,
    },
    {
      id: 'seven_streak',
      title: 'Week Warrior',
      description: '7-day streak',
      icon: '💪',
      unlocked: false,
    },
    {
      id: 'ten_tasks',
      title: 'Task Machine',
      description: 'Complete 10 tasks',
      icon: '⚡',
      unlocked: false,
    },
    {
      id: 'fifty_tasks',
      title: 'Half Century',
      description: 'Complete 50 tasks',
      icon: '🏆',
      unlocked: false,
    },
  ];

  const completedCount = Object.values(state.taskHistory).filter(Boolean).length;
  const streak = getStreak(state);

  if (completedCount >= 1) badges[0].unlocked = true;
  if (streak >= 3) badges[1].unlocked = true;
  if (streak >= 7) badges[2].unlocked = true;
  if (completedCount >= 10) badges[3].unlocked = true;
  if (completedCount >= 50) badges[4].unlocked = true;

  return badges;
}

export function getStreak(state: UserState): number {
  const today = new Date();
  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayTasks = state.roadmap?.days.find(d => d.date === dateStr);
    if (!dayTasks) break;

    const allDone = dayTasks.tasks.every(
      t => state.taskHistory[`${dateStr}_${t.id}`]
    );
    if (allDone && dayTasks.tasks.length > 0) {
      streak++;
    } else if (dayTasks.tasks.length > 0) {
      break;
    }
  }

  return streak;
}

export function getHoursLoggedToday(state: UserState): number {
  const today = new Date().toISOString().split('T')[0];
  const day = state.roadmap?.days.find(d => d.date === today);
  if (!day) return 0;

  return day.tasks
    .filter(t => state.taskHistory[`${today}_${t.id}`])
    .reduce((sum, t) => sum + t.estimatedTime, 0);
}

export function getHoursLoggedForDate(state: UserState, dateStr: string): number {
  const day = state.roadmap?.days.find(d => d.date === dateStr);
  if (!day) return 0;
  return day.tasks
    .filter(t => state.taskHistory[`${dateStr}_${t.id}`])
    .reduce((sum, t) => sum + t.estimatedTime / 60, 0);
}

export interface BurnoutStatus {
  triggered: boolean;
  consecutiveDays: number;
}

export function getBurnoutStatus(state: UserState): BurnoutStatus {
  const dismissed = state.burnoutDismissedAt;
  if (dismissed) {
    const dismissedDate = new Date(dismissed);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 3) return { triggered: false, consecutiveDays: 0 };
  }

  const today = new Date();
  let consecutive = 0;
  let maxConsecutive = 0;

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const hours = getHoursLoggedForDate(state, dateStr);

    if (hours >= 3) {
      consecutive++;
      maxConsecutive = Math.max(maxConsecutive, consecutive);
    } else {
      consecutive = 0;
    }
  }

  return {
    triggered: maxConsecutive >= 5,
    consecutiveDays: maxConsecutive,
  };
}

export function dismissBurnout(): void {
  updateState({
    burnoutDismissedAt: new Date().toISOString().split('T')[0],
  });
}

export function getDaysRemaining(state: UserState): number {
  if (!state.deadline) return 0;
  const end = new Date(state.deadline);
  const now = new Date();
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export function getOverallProgress(state: UserState): number {
  if (!state.roadmap || state.roadmap.days.length === 0) return 0;
  const totalTasks = state.roadmap.days.reduce((s, d) => s + d.tasks.length, 0);
  const completed = Object.values(state.taskHistory).filter(Boolean).length;
  return totalTasks > 0 ? Math.min(100, Math.round((completed / totalTasks) * 100)) : 0;
}

export function getWeeklyStats(state: UserState): { day: string; completed: number; total: number }[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const stats: { day: string; completed: number; total: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = days[date.getDay()];

    const day = state.roadmap?.days.find(d => d.date === dateStr);
    if (day) {
      const completed = day.tasks.filter(
        t => state.taskHistory[`${dateStr}_${t.id}`]
      ).length;
      stats.push({ day: dayOfWeek, completed, total: day.tasks.length });
    } else {
      stats.push({ day: dayOfWeek, completed: 0, total: 0 });
    }
  }

  return stats;
}

export function getMonthlyStats(state: UserState): { week: string; completed: number; total: number }[] {
  const stats: { week: string; completed: number; total: number }[] = [];
  const today = new Date();

  for (let w = 0; w < 4; w++) {
    let completed = 0;
    let total = 0;
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (27 - w * 7 - d));
      const dateStr = date.toISOString().split('T')[0];
      const day = state.roadmap?.days.find(day => day.date === dateStr);
      if (day) {
        completed += day.tasks.filter(
          t => state.taskHistory[`${dateStr}_${t.id}`]
        ).length;
        total += day.tasks.length;
      }
    }
    stats.push({ week: `W${w + 1}`, completed, total });
  }

  return stats;
}

export function getStreakDates(state: UserState): string[] {
  const dates: string[] = [];
  if (!state.roadmap) return dates;
  for (const day of state.roadmap.days) {
    const allDone = day.tasks.every(
      t => state.taskHistory[`${day.date}_${t.id}`]
    );
    if (allDone && day.tasks.length > 0) {
      dates.push(day.date);
    }
  }
  return dates;
}
