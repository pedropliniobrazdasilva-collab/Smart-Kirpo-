export enum Priority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export interface Task {
  id: string;
  title: string;
  time?: string;
  reminder: boolean;
  priority: Priority;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  repeatDays?: number[]; // 0 for Sunday, 1 for Monday, etc.
}

export type Theme = 'light' | 'dark';
export type FontSize = 'small' | 'medium' | 'large';
export type Layout = 'list' | 'blocks';
export type PrimaryColor = 'orange' | 'blue' | 'green';

export interface Settings {
    enableNotifications: boolean;
    autoIntervals: boolean;
    theme: Theme;
    primaryColor: PrimaryColor;
    fontSize: FontSize;
    layout: Layout;
    showStats: boolean;
    showAchievements: boolean;
    dailyGoals: string;
    usePin: boolean;
    pin: string | null;
    enableSounds: boolean;
    showMotivation: boolean;
}