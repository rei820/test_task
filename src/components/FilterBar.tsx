import type { FilterState, TaskStatus, TaskPriority, SortKey, Member } from '../types/task';
import { Search, ArrowUpDown, Archive } from 'lucide-react';

interface Props {
  filter: FilterState;
  onChange: (f: FilterState) => void;
  allTags: string[];
  members: Member[];
}

const statusOptions: { value: TaskStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'todo', label: '未着手' },
  { value: 'in_progress', label: '進行中' },
  { value: 'done', label: '完了' },
];

const priorityOptions: { value: TaskPriority | 'all'; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
];

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'createdAt', label: '作成日' },
  { value: 'dueDate', label: '期限日' },
  { value: 'priority', label: '優先度' },
];

export function FilterBar({ filter, onChange, allTags, members }: Props) {
  const set = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    onChange({ ...filter, [key]: value });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4 space-y-3">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
          placeholder="タスクを検索..."
          value={filter.search}
          onChange={(e) => set('search', e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-gray-500 text-xs">ステータス</span>
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            {statusOptions.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => set('status', value)}
                className={`px-2 py-1 text-xs transition-colors ${
                  filter.status === value
                    ? 'bg-violet-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-gray-500 text-xs">優先度</span>
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            {priorityOptions.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => set('priority', value)}
                className={`px-2 py-1 text-xs transition-colors ${
                  filter.priority === value
                    ? 'bg-violet-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 担当者フィルター */}
        {members.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-gray-500 text-xs">担当者</span>
            <div className="flex rounded-lg overflow-hidden border border-gray-200">
              <button
                onClick={() => set('assigneeId', '')}
                className={`px-2 py-1 text-xs transition-colors ${
                  filter.assigneeId === ''
                    ? 'bg-violet-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                全員
              </button>
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => set('assigneeId', m.id)}
                  className={`px-2 py-1 text-xs transition-colors flex items-center gap-1 ${
                    filter.assigneeId === m.id
                      ? 'text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  style={filter.assigneeId === m.id ? { backgroundColor: m.color } : {}}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: filter.assigneeId === m.id ? 'white' : m.color }}
                  />
                  {m.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {allTags.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-gray-500 text-xs">タグ</span>
            <select
              value={filter.tag}
              onChange={(e) => set('tag', e.target.value)}
              className="rounded-lg border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-violet-300"
            >
              <option value="">すべて</option>
              {allTags.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-1 ml-auto">
          <ArrowUpDown size={12} className="text-gray-400" />
          <select
            value={filter.sortKey}
            onChange={(e) => set('sortKey', e.target.value as SortKey)}
            className="rounded-lg border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-violet-300"
          >
            {sortOptions.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <button
            onClick={() => set('sortAsc', !filter.sortAsc)}
            className="px-2 py-1 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            {filter.sortAsc ? '昇順' : '降順'}
          </button>
        </div>

        <button
          onClick={() => set('showArchived', !filter.showArchived)}
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg border transition-colors ${
            filter.showArchived
              ? 'bg-amber-500 text-white border-amber-500'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Archive size={12} />
          アーカイブ
        </button>
      </div>
    </div>
  );
}
