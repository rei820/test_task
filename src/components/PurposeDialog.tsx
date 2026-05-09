import { useState } from 'react';
import { Target, SkipForward } from 'lucide-react';

interface Props {
  suggestions: string[];
  onConfirm: (purpose: string | undefined) => void;
}

export function PurposeDialog({ suggestions, onConfirm }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [custom, setCustom] = useState('');

  const handleConfirm = () => {
    const purpose = custom.trim() || selected || undefined;
    onConfirm(purpose);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <Target size={18} className="text-violet-500" />
          <h2 className="text-lg font-bold text-gray-800">このタスクの目的は？</h2>
        </div>
        <p className="text-xs text-gray-500 mb-5">目的を記録しておくと、数日後に振り返りやすくなります。</p>

        <div className="space-y-2 mb-4">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => { setSelected(s); setCustom(''); }}
              className={`w-full text-left px-4 py-3 rounded-2xl border text-sm transition-all ${
                selected === s
                  ? 'border-violet-400 bg-violet-50 text-violet-700 font-medium'
                  : 'border-gray-100 text-gray-600 hover:border-violet-200 hover:bg-violet-50/50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <textarea
          value={custom}
          onChange={(e) => { setCustom(e.target.value); setSelected(null); }}
          placeholder="または自由に入力..."
          rows={2}
          className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 mb-4"
        />

        <div className="flex gap-2">
          <button
            onClick={() => onConfirm(undefined)}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 text-gray-400 rounded-2xl text-sm hover:bg-gray-50 transition-colors"
          >
            <SkipForward size={13} /> スキップ
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-2xl text-sm font-medium hover:from-violet-600 hover:to-indigo-600 transition-all shadow-lg shadow-violet-200"
          >
            登録する
          </button>
        </div>
      </div>
    </div>
  );
}
