import { useState } from 'react';
import type { Member } from '../types/task';
import { UserPlus, X, Users, Shield, Eye, EyeOff } from 'lucide-react';

interface Props {
  members: Member[];
  currentMember: Member;
  onAdd: (name: string, isAdmin?: boolean, pin?: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Pick<Member, 'isAdmin' | 'pin'>>) => void;
}

export function MemberPanel({ members, currentMember, onAdd, onDelete, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [newIsAdmin, setNewIsAdmin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [showNewPin, setShowNewPin] = useState(false);
  const [editingPinId, setEditingPinId] = useState<string | null>(null);
  const [editPin, setEditPin] = useState('');
  const [showEditPin, setShowEditPin] = useState(false);

  if (!currentMember.isAdmin) return null;

  const handleAdd = () => {
    const name = input.trim();
    if (!name) return;
    onAdd(name, newIsAdmin, newPin.trim() || undefined);
    setInput('');
    setNewPin('');
    setNewIsAdmin(false);
  };

  const handleSavePin = (id: string) => {
    onUpdate(id, { pin: editPin.trim() || undefined });
    setEditingPinId(null);
    setEditPin('');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border transition-colors ${
          open
            ? 'bg-violet-50 border-violet-300 text-violet-700'
            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Users size={15} />
        <span className="hidden sm:inline">メンバー</span>
        {members.length > 0 && (
          <span className="w-5 h-5 rounded-full bg-violet-500 text-white text-xs flex items-center justify-center">
            {members.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-40 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-600 mb-3">メンバー管理（管理者専用）</p>

          {members.length === 0 ? (
            <p className="text-xs text-gray-400 mb-3">まだメンバーがいません</p>
          ) : (
            <div className="flex flex-col gap-2 mb-3">
              {members.map((m) => (
                <div key={m.id} className="rounded-xl border border-gray-100 p-2.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                      <span className="text-sm text-gray-700 font-medium">{m.name}</span>
                      {m.isAdmin && (
                        <span className="inline-flex items-center gap-0.5 text-xs text-amber-600 font-medium">
                          <Shield size={10} /> 管理者
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {/* 管理者トグル（自分自身は変更不可） */}
                      {m.id !== currentMember.id && (
                        <button
                          onClick={() => onUpdate(m.id, { isAdmin: !m.isAdmin })}
                          title={m.isAdmin ? '管理者を解除' : '管理者に設定'}
                          className={`p-1 rounded-lg transition-colors ${
                            m.isAdmin ? 'text-amber-500 hover:bg-amber-50' : 'text-gray-300 hover:text-amber-400 hover:bg-amber-50'
                          }`}
                        >
                          <Shield size={13} />
                        </button>
                      )}
                      {m.id !== currentMember.id && (
                        <button
                          onClick={() => onDelete(m.id)}
                          className="p-1 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* PIN設定 */}
                  {editingPinId === m.id ? (
                    <div className="flex gap-1.5">
                      <div className="relative flex-1">
                        <input
                          autoFocus
                          type={showEditPin ? 'text' : 'password'}
                          value={editPin}
                          onChange={(e) => setEditPin(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSavePin(m.id); if (e.key === 'Escape') setEditingPinId(null); }}
                          placeholder="新しいPIN（空=解除）"
                          className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-violet-300"
                        />
                        <button onClick={() => setShowEditPin((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                          {showEditPin ? <EyeOff size={11} /> : <Eye size={11} />}
                        </button>
                      </div>
                      <button onClick={() => handleSavePin(m.id)} className="px-2 py-1 bg-violet-500 text-white rounded-lg text-xs hover:bg-violet-600">保存</button>
                      <button onClick={() => setEditingPinId(null)} className="px-2 py-1 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50">×</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingPinId(m.id); setEditPin(m.pin ?? ''); }}
                      className="text-xs text-gray-400 hover:text-violet-600 transition-colors"
                    >
                      {m.pin ? '🔒 PIN変更' : '🔓 PINを設定'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 追加フォーム */}
          <div className="border-t border-gray-100 pt-3 space-y-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="新しいメンバーの名前..."
              className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
            <div className="relative">
              <input
                type={showNewPin ? 'text' : 'password'}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="PIN（任意）"
                className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
              <button onClick={() => setShowNewPin((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                {showNewPin ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newIsAdmin} onChange={(e) => setNewIsAdmin(e.target.checked)} className="accent-amber-500 w-3.5 h-3.5" />
              <Shield size={12} className="text-amber-500" />
              <span className="text-xs text-gray-600">管理者として追加</span>
            </label>
            <button
              onClick={handleAdd}
              disabled={!input.trim()}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-violet-500 text-white rounded-xl text-xs font-medium hover:bg-violet-600 disabled:opacity-40 transition-colors"
            >
              <UserPlus size={13} />
              追加
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
