import type { Task, Member } from '../types/task';
import { isOverdue } from '../utils/taskUtils';
import { CheckCircle2, Clock, AlertTriangle, ListTodo } from 'lucide-react';

interface Props {
  tasks: Task[];
  members: Member[];
  isAdmin: boolean;
}

export function Dashboard({ tasks, members, isAdmin }: Props) {
  const active = tasks.filter((t) => !t.archived);
  const total = active.length;
  const done = active.filter((t) => t.status === 'done').length;
  const inProgress = active.filter((t) => t.status === 'in_progress').length;
  const overdue = active.filter(isOverdue).length;

  const stats = [
    { label: '総タスク', value: total, icon: ListTodo, color: 'bg-violet-100 text-violet-700' },
    { label: '進行中', value: inProgress, icon: Clock, color: 'bg-blue-100 text-blue-700' },
    { label: '完了', value: done, icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700' },
    { label: '期限切れ', value: overdue, icon: AlertTriangle, color: 'bg-red-100 text-red-700' },
  ];

  const memberStats = members.map((m) => {
    const memberTasks = active.filter((t) => t.assigneeId === m.id);
    const memberDone = memberTasks.filter((t) => t.status === 'done').length;
    const pct = memberTasks.length === 0 ? 0 : Math.round((memberDone / memberTasks.length) * 100);
    return { member: m, total: memberTasks.length, done: memberDone, pct };
  });

  return (
    <div className="mb-6 space-y-4">
      {/* サマリーカード */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3 border border-gray-100">
            <div className={`p-2 rounded-xl ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* メンバー別進捗バー（管理者のみ） */}
      {isAdmin && memberStats.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">メンバー別進捗</h3>
          <div className="space-y-3">
            {memberStats.map(({ member, total: t, done: d, pct }) => (
              <div key={member.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: member.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">{member.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {d} / {t} 完了 ({pct}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: member.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
