import { Plus, Trash2, Clock, ChevronDown } from 'lucide-react';
import type { DecomposedAction } from '../utils/taskDecomposer';

const MINUTES_OPTIONS = [15, 30, 45, 60, 90, 120];
const PRIORITY_LABELS = { high: '高', medium: '中', low: '低' } as const;
const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-600',
  medium: 'bg-amber-100 text-amber-600',
  low: 'bg-emerald-100 text-emerald-600',
} as const;

interface Props {
  actions: DecomposedAction[];
  tagSuggestions: string[];
  onUpdate: (index: number, action: DecomposedAction) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onConfirm: () => void;
  onRetry: () => void;
}

export function DecomposePreview({
  actions, tagSuggestions, onUpdate, onAdd, onRemove, onConfirm, onRetry,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">AI 分解結果</h2>
          <p className="text-xs text-gray-500 mt-0.5">{actions.length} 件のアクションに分解しました。編集してから登録してください。</p>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3">
          {actions.map((action, i) => (
            <div key={i} className="border border-gray-100 rounded-2xl p-4 space-y-3 bg-gray-50/50">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <input
                  value={action.title}
                  onChange={(e) => onUpdate(i, { ...action, title: e.target.value })}
                  className="flex-1 text-sm font-medium text-gray-800 bg-transparent border-b border-dashed border-gray-300 focus:outline-none focus:border-violet-400 pb-0.5"
                  placeholder="アクション名"
                />
                <button onClick={() => onRemove(i)} className="text-gray-300 hover:text-red-400 shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap pl-7">
                {/* 所要時間 */}
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1">
                  <Clock size={12} className="text-gray-400" />
                  <select
                    value={action.estimatedMinutes}
                    onChange={(e) => onUpdate(i, { ...action, estimatedMinutes: Number(e.target.value) })}
                    className="text-xs text-gray-600 bg-transparent focus:outline-none"
                  >
                    {MINUTES_OPTIONS.map((m) => (
                      <option key={m} value={m}>{m}分</option>
                    ))}
                  </select>
                  <ChevronDown size={10} className="text-gray-400" />
                </div>

                {/* 優先度 */}
                <select
                  value={action.priority}
                  onChange={(e) => onUpdate(i, { ...action, priority: e.target.value as DecomposedAction['priority'] })}
                  className={`text-xs font-medium px-2 py-1 rounded-lg border-0 focus:outline-none ${PRIORITY_COLORS[action.priority]}`}
                >
                  {(['high', 'medium', 'low'] as const).map((p) => (
                    <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                  ))}
                </select>

                {/* タグ提案 */}
                {tagSuggestions.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      const has = action.tags.includes(tag);
                      onUpdate(i, { ...action, tags: has ? action.tags.filter((t) => t !== tag) : [...action.tags, tag] });
                    }}
                    className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
                      action.tags.includes(tag)
                        ? 'bg-violet-100 text-violet-600 border-violet-200'
                        : 'bg-white text-gray-400 border-gray-200 hover:border-violet-200'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={onAdd}
            className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-gray-300 rounded-2xl text-sm text-gray-400 hover:border-violet-300 hover:text-violet-500 transition-colors"
          >
            <Plus size={14} /> アクションを追加
          </button>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
          <button onClick={onRetry} className="flex-1 py-2.5 border border-gray-200 text-gray-500 rounded-2xl text-sm hover:bg-gray-50 transition-colors">
            やり直す
          </button>
          <button
            onClick={onConfirm}
            disabled={actions.length === 0 || actions.some((a) => !a.title.trim())}
            className="flex-1 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-2xl text-sm font-medium hover:from-violet-600 hover:to-indigo-600 disabled:opacity-40 transition-all shadow-lg shadow-violet-200"
          >
            次へ（目的を確認）
          </button>
        </div>
      </div>
    </div>
  );
}
