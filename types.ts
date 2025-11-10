
export enum Priority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export enum Repeat {
  None = 'none',
  Daily = 'daily',
  Weekly = 'weekly',
}

export interface Task {
  id: string;
  title: string;
  time?: string;
  reminder: boolean;
  repeat: Repeat;
  priority: Priority;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  repeatDays?: number[]; // 0 for Sunday, 1 for Monday, etc.
}