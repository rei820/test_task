import { useState, useEffect, type KeyboardEvent } from 'react';
import type { Task, TaskStatus, TaskPriority, Member } from '../types/task';
import { X, Plus, Tag, User } from 'lucide-react';

interface Props {
  initial?: Task | null;
  members: Member[];
  onSubmit: (data: {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    tags: string[];
    dueDate?: string;
    assigneeId?: string;
  }) => void;
  onClose: () => void;
}

const defaultForm = {
  title: '',
  description: '',
  status: 'todo' as TaskStatus,
  priority: 'medium' as TaskPriority,
  dueDate: '',
  tagInput: '',
  tags: [] as string[],
  assigneeId: '',
};

export function TaskForm({ initial, members, onSubmit, onClose }: Props) {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title,
        description: initial.description ?? '',
        status: initial.status,
        priority: initial.priority,
        dueDate: initial.dueDate ?? '',
        tagInput: '',
        tags: [...initial.tags],
        assigneeId: initial.assigneeId ?? '',
      });
    } else {
      setForm(defaultForm);
    }
  }, [initial]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const addTag = () => {
    const t = form.tagInput.trim();
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]);
    set('tagInput', '');
  };

  const removeTag = (tag: string) => set('tags', form.tags.filter((t) => t !== tag));

  const handleTagKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag(); }
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      status: form.status,
      priority: form.priority,
      tags: form.tags,
      dueDate: form.dueDate || undefined,
      assigneeId: form.assigneeId || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            {initial ? 'タスクを編集' : '新しいタスク'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">タイトル *</label>
            <input
              autoFocus
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
              placeholder="タスク名を入力..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">説明</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
              placeholder="詳細を入力..."
            />
          </div>

          {/* 担当者 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">担当者</label>
            {members.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">メンバーを先に追加してください</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => set('assigneeId', '')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition-colors ${
                    !form.assigneeId
                      ? 'bg-gray-100 border-gray-300 text-gray-700 font-medium'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <User size={12} />
                  未割当
                </button>
                {members.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => set('assigneeId', m.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition-colors ${
                      form.assigneeId === m.id
                        ? 'border-transparent font-medium text-white'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                    style={form.assigneeId === m.id ? { backgroundColor: m.color, borderColor: m.color } : {}}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: m.color }}
                    />
                    {m.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">ステータス</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value as TaskStatus)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
              >
                <option value="todo">未着手</option>
                <option value="in_progress">進行中</option>
                <option value="done">完了</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">優先度</label>
              <select
                value={form.priority}
                onChange={(e) => set('priority', e.target.value as TaskPriority)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
              >
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">期限日</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => set('dueDate', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">タグ</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={form.tagInput}
                  onChange={(e) => set('tagInput', e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                  placeholder="タグを入力して Enter"
                />
              </div>
              <button
                onClick={addTag}
                className="px-3 py-2 bg-violet-100 text-violet-700 rounded-xl text-sm hover:bg-violet-200 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    onClick={() => removeTag(tag)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-violet-100 text-violet-700 cursor-pointer hover:bg-red-100 hover:text-red-600 transition-colors"
                  >
                    {tag} <X size={10} />
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.title.trim()}
            className="flex-1 py-2.5 rounded-xl bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {initial ? '更新する' : '作成する'}
          </button>
        </div>
      </div>
    </div>
  );
}
