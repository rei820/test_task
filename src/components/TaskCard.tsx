import type { Task, TaskStatus, Member } from '../types/task';
import { TagBadge } from './TagBadge';
import { isOverdue } from '../utils/taskUtils';
import {
  Calendar, Pencil, Trash2, Archive, ArchiveRestore,
  CircleDot, CircleCheck, Circle,
} from 'lucide-react';

interface Props {
  task: Task;
  assignee?: Member;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

const PRIORITY_STYLES = {
  high: 'border-l-red-500',
  medium: 'border-l-amber-400',
  low: 'border-l-emerald-400',
};

const PRIORITY_LABELS = { high: '高', medium: '中', low: '低' };
const PRIORITY_BADGE = {
  high: 'bg-red-100 text-red-600',
  medium: 'bg-amber-100 text-amber-600',
  low: 'bg-emerald-100 text-emerald-600',
};

const STATUS_CYCLE: TaskStatus[] = ['todo', 'in_progress', 'done'];
const STATUS_LABELS = { todo: '未着手', in_progress: '進行中', done: '完了' };

function StatusIcon({ status }: { status: TaskStatus }) {
  if (status === 'done') return <CircleCheck size={20} className="text-emerald-500" />;
  if (status === 'in_progress') return <CircleDot size={20} className="text-blue-500" />;
  return <Circle size={20} className="text-gray-300" />;
}

export function TaskCard({ task, assignee, onEdit, onDelete, onArchive, onUnarchive, onStatusChange }: Props) {
  const overdue = isOverdue(task);

  const cycleStatus = () => {
    const idx = STATUS_CYCLE.indexOf(task.status);
    onStatusChange(task.id, STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]);
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border-l-4 border border-gray-100 p-4 flex flex-col gap-2 transition-all hover:shadow-md ${
        PRIORITY_STYLES[task.priority]
      } ${task.status === 'done' ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        <button onClick={cycleStatus} className="mt-0.5 shrink-0" title={STATUS_LABELS[task.status]}>
          <StatusIcon status={task.status} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-medium leading-snug ${
                task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'
              }`}
            >
              {task.title}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${PRIORITY_BADGE[task.priority]}`}>
              {PRIORITY_LABELS[task.priority]}
            </span>
          </div>

          {task.description && (
            <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{task.description}</p>
          )}
        </div>

        <div className="flex gap-1 shrink-0">
          <button onClick={() => onEdit(task)} className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors">
            <Pencil size={14} />
          </button>
          {task.archived ? (
            <button onClick={() => onUnarchive(task.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
              <ArchiveRestore size={14} />
            </button>
          ) : (
            <button onClick={() => onArchive(task.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
              <Archive size={14} />
            </button>
          )}
          <button onClick={() => onDelete(task.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap ml-8">
        {assignee && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: assignee.color }}
          >
            {assignee.name}
          </span>
        )}
        {task.tags.map((tag) => (
          <TagBadge key={tag} tag={tag} />
        ))}
        {task.dueDate && (
          <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
            <Calendar size={11} />
            {task.dueDate}
            {overdue && ' (期限切れ)'}
          </span>
        )}
      </div>
    </div>
  );
}
