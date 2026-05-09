import { useState, useRef } from 'react';
import { Mic, MicOff, Image, Send, Loader2, X, Sparkles, ChevronDown } from 'lucide-react';

interface Props {
  onSubmitText: (text: string) => void;
  onSubmitImage: (base64: string, mediaType: string) => void;
  processing: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecognition = any;

export function InboxBar({ onSubmitText, onSubmitImage, processing }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ base64: string; mediaType: string } | null>(null);
  const recognitionRef = useRef<AnyRecognition>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleTextSubmit = () => {
    if (!text.trim()) return;
    onSubmitText(text.trim());
    setText('');
  };

  const startVoice = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) { alert('このブラウザは音声入力に対応していません。'); return; }
    const rec = new SR();
    rec.lang = 'ja-JP';
    rec.continuous = false;
    rec.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setText(transcript);
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const [header, base64] = dataUrl.split(',');
      const mediaType = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
      setImagePreview(dataUrl);
      setImageMeta({ base64, mediaType });
    };
    reader.readAsDataURL(file);
  };

  const handleImageSubmit = () => {
    if (!imageMeta) return;
    onSubmitImage(imageMeta.base64, imageMeta.mediaType);
    setImagePreview(null);
    setImageMeta(null);
  };

  return (
    <div className="mb-4">
      {/* トグルボタン */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-violet-200 hover:bg-violet-50/50 transition-all group"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 group-hover:text-violet-600">
          <Sparkles size={15} className="text-violet-400" />
          AI でタスクを整理
        </div>
        <ChevronDown
          size={15}
          className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 入力エリア（展開時のみ表示） */}
      {open && (
        <div className="mt-2 bg-white rounded-2xl border border-violet-100 shadow-sm p-4">
          {/* 画像プレビュー */}
          {imagePreview && (
            <div className="relative mb-3">
              <img src={imagePreview} alt="preview" className="w-full max-h-40 object-contain rounded-xl border border-gray-100" />
              <button
                onClick={() => { setImagePreview(null); setImageMeta(null); }}
                className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow text-gray-500 hover:text-red-500"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* 音声認識中 */}
          {listening && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-red-50 rounded-xl text-red-500 text-sm">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              聞いています... タップして停止
            </div>
          )}

          <div className="flex gap-2">
            <textarea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTextSubmit(); } }}
              placeholder="何でも投げ込んでください（例：来月の新規B2B提案を準備する）"
              maxLength={1000}
              rows={2}
              className="flex-1 resize-none border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 placeholder:text-gray-400"
            />

            <div className="flex flex-col gap-1.5">
              <button
                onClick={listening ? stopVoice : startVoice}
                className={`p-2.5 rounded-xl transition-colors ${
                  listening
                    ? 'bg-red-100 text-red-500 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-violet-100 hover:text-violet-600'
                }`}
                title="音声入力"
              >
                {listening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              <button
                onClick={() => fileRef.current?.click()}
                className="p-2.5 rounded-xl bg-gray-100 text-gray-500 hover:bg-violet-100 hover:text-violet-600 transition-colors"
                title="画像から入力"
              >
                <Image size={16} />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/heic,image/webp"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = ''; }}
              />

              <button
                onClick={imageMeta ? handleImageSubmit : handleTextSubmit}
                disabled={processing || (!text.trim() && !imageMeta)}
                className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600 disabled:opacity-40 transition-all shadow-md shadow-violet-200"
                title="AIで整理"
              >
                {processing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-2 text-right">{text.length}/1000</p>
        </div>
      )}
    </div>
  );
}
