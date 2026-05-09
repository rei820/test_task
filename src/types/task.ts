export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';
export type SortKey = 'createdAt' | 'dueDate' | 'priority';

export interface Member {
  id: string;
  name: string;
  color: string;
  isAdmin: boolean;
  pin?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  assigneeId?: string;
}

export interface FilterState {
  search: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  tag: string;
  assigneeId: string;
  showArchived: boolean;
  sortKey: SortKey;
  sortAsc: boolean;
}
