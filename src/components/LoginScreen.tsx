import { useState } from 'react';
import type { Member } from '../types/task';
import { UserPlus, LogIn, CheckCircle2, Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface Props {
  members: Member[];
  onLogin: (memberId: string) => void;
  onAddMember: (name: string, isAdmin?: boolean, pin?: string) => Promise<Member>;
}

type Step = 'select' | 'pin' | 'setup';

export function LoginScreen({ members, onLogin, onAddMember }: Props) {
  const [step, setStep] = useState<Step>(members.length === 0 ? 'setup' : 'select');
  const [selected, setSelected] = useState<Member | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showPin, setShowPin] = useState(false);

  // 新規メンバー追加フォーム
  const [newName, setNewName] = useState('');
  const [newIsAdmin, setNewIsAdmin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [showNewPin, setShowNewPin] = useState(false);
  const [addingInSelect, setAddingInSelect] = useState(false);

  const handleSelectMember = (m: Member) => {
    if (m.pin) {
      setSelected(m);
      setPinInput('');
      setPinError(false);
      setStep('pin');
    } else {
      onLogin(m.id);
    }
  };

  const handlePinSubmit = () => {
    if (!selected) return;
    if (pinInput === selected.pin) {
      onLogin(selected.id);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleAddMember = async () => {
    const name = newName.trim();
    if (!name) return;
    const pin = newPin.trim() || undefined;
    const member = await onAddMember(name, newIsAdmin, pin);
    setNewName('');
    setNewPin('');
    setNewIsAdmin(false);
    setAddingInSelect(false);
    onLogin(member.id);
  };

  // ---- PIN入力画面 ----
  if (step === 'pin' && selected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-3xl shadow-xl mb-4 text-white text-2xl font-bold"
              style={{ backgroundColor: selected.color }}
            >
              {selected.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-gray-800">{selected.name}</h2>
            {selected.isAdmin && (
              <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                <Shield size={11} /> 管理者
              </div>
            )}
            <p className="text-sm text-gray-500 mt-2">PINを入力してください</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-violet-100 p-6 space-y-4">
            <div className="relative">
              <input
                autoFocus
                type={showPin ? 'text' : 'password'}
                value={pinInput}
                onChange={(e) => { setPinInput(e.target.value); setPinError(false); }}
                onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
                placeholder="PIN"
                className={`w-full border rounded-xl px-4 py-3 text-sm text-center tracking-widest focus:outline-none focus:ring-2 ${
                  pinError ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-violet-300'
                }`}
              />
              <button
                onClick={() => setShowPin((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {pinError && (
              <div className="flex items-center gap-2 text-red-500 text-xs">
                <AlertCircle size={13} /> PINが正しくありません
              </div>
            )}

            <button
              onClick={handlePinSubmit}
              disabled={!pinInput}
              className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-xl text-sm font-medium hover:from-violet-600 hover:to-indigo-600 disabled:opacity-40 transition-all shadow-lg shadow-violet-200"
            >
              ログイン
            </button>
            <button
              onClick={() => { setStep('select'); setSelected(null); }}
              className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← 戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- 初期セットアップ画面 ----
  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-xl shadow-violet-200 mb-4">
              <CheckCircle2 size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              タスク管理
            </h1>
            <p className="text-sm text-gray-500 mt-1">最初のアカウントを作成します</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-violet-100 p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">名前 *</label>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                placeholder="名前を入力..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">PIN（任意）</label>
              <div className="relative">
                <input
                  type={showNewPin ? 'text' : 'password'}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="設定しない場合は空白"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                />
                <button onClick={() => setShowNewPin((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showNewPin ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 cursor-pointer hover:bg-amber-50 hover:border-amber-200 transition-colors">
              <input
                type="checkbox"
                checked={newIsAdmin}
                onChange={(e) => setNewIsAdmin(e.target.checked)}
                className="accent-amber-500 w-4 h-4"
              />
              <div className="flex items-center gap-2">
                <Shield size={15} className="text-amber-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">管理者として登録</p>
                  <p className="text-xs text-gray-400">全メンバーのタスクを閲覧・管理できます</p>
                </div>
              </div>
            </label>

            <button
              onClick={handleAddMember}
              disabled={!newName.trim()}
              className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-xl text-sm font-medium hover:from-violet-600 hover:to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-200"
            >
              はじめる
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">データはこのブラウザにのみ保存されます</p>
        </div>
      </div>
    );
  }

  // ---- メンバー選択画面 ----
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-xl shadow-violet-200 mb-4">
            <CheckCircle2 size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            タスク管理
          </h1>
          <p className="text-sm text-gray-500 mt-1">誰として使用しますか？</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-violet-100 p-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">メンバーを選択</p>

          <div className="flex flex-col gap-2 mb-4">
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelectMember(m)}
                className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-md transition-all group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ backgroundColor: m.color }}
                >
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{m.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {m.isAdmin && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-amber-600 font-medium">
                        <Shield size={10} /> 管理者
                      </span>
                    )}
                    {m.pin && (
                      <span className="text-xs text-gray-400">PIN保護</span>
                    )}
                  </div>
                </div>
                <LogIn size={15} className="text-gray-300 group-hover:text-gray-500 shrink-0" />
              </button>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4">
            {addingInSelect ? (
              <div className="space-y-3">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddMember(); if (e.key === 'Escape') setAddingInSelect(false); }}
                  placeholder="名前を入力..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                />
                <div className="relative">
                  <input
                    type={showNewPin ? 'text' : 'password'}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="PIN（任意）"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                  />
                  <button onClick={() => setShowNewPin((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showNewPin ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newIsAdmin} onChange={(e) => setNewIsAdmin(e.target.checked)} className="accent-amber-500 w-4 h-4" />
                  <Shield size={13} className="text-amber-500" />
                  <span className="text-xs text-gray-600">管理者として登録</span>
                </label>
                <div className="flex gap-2">
                  <button onClick={handleAddMember} disabled={!newName.trim()} className="flex-1 py-2 bg-violet-500 text-white rounded-xl text-sm font-medium hover:bg-violet-600 disabled:opacity-40 transition-colors">追加してログイン</button>
                  <button onClick={() => { setAddingInSelect(false); setNewName(''); setNewPin(''); }} className="px-3 py-2 border border-gray-200 text-gray-500 rounded-xl text-sm hover:bg-gray-50 transition-colors">×</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingInSelect(true)}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-colors"
              >
                <UserPlus size={15} />
                新しいメンバーを追加
              </button>
            )}
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">データはこのブラウザにのみ保存されます</p>
      </div>
    </div>
  );
}
