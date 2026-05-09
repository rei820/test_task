import type { Task, TaskStatus, Member } from '../types/task';
import { TaskCard } from './TaskCard';
import { ClipboardList } from 'lucide-react';

interface Props {
  tasks: Task[];
  members: Member[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

export function TaskList({ tasks, members, onEdit, onDelete, onArchive, onUnarchive, onStatusChange }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <ClipboardList size={48} className="mb-3 opacity-30" />
        <p className="text-sm">タスクがありません</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          assignee={members.find((m) => m.id === task.assigneeId)}
          onEdit={onEdit}
          onDelete={onDelete}
          onArchive={onArchive}
          onUnarchive={onUnarchive}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
