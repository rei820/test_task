import { useState } from 'react';
import { CheckCircle2, Loader2, X, Sparkles, ChevronDown } from 'lucide-react';
import type { Proposal } from '../hooks/useAssignmentProposal';
import type { Member } from '../types/task';

const PRIORITY_LABEL = { high: '高', medium: '中', low: '低' } as const;
const PRIORITY_COLOR = {
  high: 'bg-red-100 text-red-600',
  medium: 'bg-amber-100 text-amber-600',
  low: 'bg-emerald-100 text-emerald-600',
} as const;

interface Props {
  step: 'loading' | 'ready' | 'error';
  proposals: Proposal[];
  members: Member[];
  errorMessage: string;
  onApprove: (taskId: string, memberId: string) => Promise<void>;
  onClose: () => void;
}

export function AssignmentProposal({
  step, proposals, members, errorMessage, onApprove, onClose,
}: Props) {
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [approving, setApproving] = useState<string | null>(null);
  const [approvingAll, setApprovingAll] = useState(false);

  const getMemberId = (taskId: string, defaultId: string) => overrides[taskId] ?? defaultId;

  const handleApprove = async (taskId: string, defaultMemberId: string) => {
    setApproving(taskId);
    await onApprove(taskId, getMemberId(taskId, defaultMemberId));
    setApproving(null);
  };

  const handleApproveAll = async () => {
    setApprovingAll(true);
    for (const p of proposals) {
      await onApprove(p.taskId, getMemberId(p.taskId, p.memberId));
    }
    setApprovingAll(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-violet-500" />
              <h2 className="text-lg font-bold text-gray-800">AI 振り分け提案</h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {step === 'ready' ? `${proposals.length} 件の提案` : '分析中...'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4">
          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-violet-500">
              <Loader2 size={32} className="animate-spin" />
              <p className="text-sm">Gemini が分析中...</p>
            </div>
          )}

          {step === 'error' && (
            <div className="py-8 text-center text-red-500 text-sm">{errorMessage}</div>
          )}

          {step === 'ready' && proposals.length === 0 && (
            <div className="py-8 text-center text-gray-400 text-sm">すべて承認済みです</div>
          )}

          {step === 'ready' && proposals.length > 0 && (
            <div className="space-y-3">
              {proposals.map((p) => {
                const selectedMemberId = getMemberId(p.taskId, p.memberId);
                const selectedMember = members.find((m) => m.id === selectedMemberId);
                return (
                  <div key={p.taskId} className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{p.task.title}</p>
                        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLOR[p.task.priority]}`}>
                          {PRIORITY_LABEL[p.task.priority]}優先
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: selectedMember?.color }}
                      >
                        {selectedMember?.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="relative flex-1">
                        <select
                          value={selectedMemberId}
                          onChange={(e) => setOverrides((prev) => ({ ...prev, [p.taskId]: e.target.value }))}
                          className="w-full text-sm text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-1.5 pr-7 focus:outline-none focus:ring-2 focus:ring-violet-300 appearance-none"
                        >
                          {members.map((m) => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mb-3 pl-1">💡 {p.reason}</p>

                    <button
                      onClick={() => handleApprove(p.taskId, p.memberId)}
                      disabled={approving === p.taskId}
                      className="w-full flex items-center justify-center gap-1.5 py-2 bg-violet-500 text-white rounded-xl text-sm font-medium hover:bg-violet-600 disabled:opacity-50 transition-colors"
                    >
                      {approving === p.taskId
                        ? <Loader2 size={14} className="animate-spin" />
                        : <CheckCircle2 size={14} />
                      }
                      承認
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {step === 'ready' && proposals.length > 1 && (
          <div className="px-6 py-4 border-t border-gray-100">
            <button
              onClick={handleApproveAll}
              disabled={approvingAll}
              className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-2xl text-sm font-medium hover:from-violet-600 hover:to-indigo-600 disabled:opacity-50 transition-all shadow-lg shadow-violet-200 flex items-center justify-center gap-2"
            >
              {approvingAll ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              すべて承認（{proposals.length} 件）
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
