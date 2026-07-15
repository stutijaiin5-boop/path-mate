export type CurrentLevel = 'beginner' | 'intermediate' | 'almost-there';
export type TaskCategory = 'study' | 'practice' | 'networking' | 'personal';
export type Commitment = 'school' | 'college' | 'job' | 'internship' | 'coaching' | 'family';
export type Priority = 'low' | 'medium' | 'high';

export interface UserState {
  name: string;
  goal: string;
  currentLevel: CurrentLevel;
  hoursPerDay: number;
  deadline: string;
  commitments: Commitment[];
  darkMode: boolean;
  notifications: boolean;
  onboardingComplete: boolean;
  roadmap: Roadmap | null;
  taskHistory: Record<string, boolean>;
  burnoutDismissedAt: string | null;
  replanDismissedAt: string | null;
}

export interface Phase {
  id: string;
  title: string;
  weekRange: string;
  startDay: number;
  endDay: number;
  description: string;
  milestone: string;
}

export interface Task {
  id: string;
  title: string;
  estimatedTime: number;
  category: TaskCategory;
  completed: boolean;
  date: string;
  day: number;
  phaseId: string;
  priority?: Priority;
  aiNote?: string;
}

export interface DayPlan {
  day: number;
  date: string;
  phaseId: string;
  tasks: Task[];
  completed: boolean;
  focus: string;
}

export interface Roadmap {
  phases: Phase[];
  days: DayPlan[];
  totalDays: number;
  startDate: string;
  endDate: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface ProgressStatus {
  label: string;
  variant: 'ahead' | 'on-track' | 'behind' | 'critical';
  daysDiff: number;
}

export interface WeekGroup {
  weekIndex: number;
  label: string;
  days: DayPlan[];
  completedDays: number;
  totalDays: number;
}
