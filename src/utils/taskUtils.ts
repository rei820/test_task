import type { Task, FilterState, TaskPriority } from '../types/task';

const PRIORITY_ORDER: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };

export function filterAndSort(tasks: Task[], filter: FilterState): Task[] {
  let result = tasks.filter((t) => {
    if (!filter.showArchived && t.archived) return false;
    if (filter.showArchived && !t.archived) return false;
    if (filter.status !== 'all' && t.status !== filter.status) return false;
    if (filter.priority !== 'all' && t.priority !== filter.priority) return false;
    if (filter.tag && !t.tags.includes(filter.tag)) return false;
    if (filter.assigneeId && t.assigneeId !== filter.assigneeId) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      if (!t.title.toLowerCase().includes(q) && !(t.description ?? '').toLowerCase().includes(q))
        return false;
    }
    return true;
  });

  result = [...result].sort((a, b) => {
    let cmp = 0;
    if (filter.sortKey === 'priority') {
      cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    } else if (filter.sortKey === 'dueDate') {
      cmp = (a.dueDate ?? 'z').localeCompare(b.dueDate ?? 'z');
    } else {
      cmp = a.createdAt.localeCompare(b.createdAt);
    }
    return filter.sortAsc ? cmp : -cmp;
  });

  return result;
}

export function getAllTags(tasks: Task[]): string[] {
  return [...new Set(tasks.flatMap((t) => t.tags))].sort();
}

export function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === 'done') return false;
  return new Date(task.dueDate) < new Date(new Date().toDateString());
}
