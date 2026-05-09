import { useState } from 'react';
import { decomposeText, decomposeImage } from '../utils/taskDecomposer';
import type { DecomposeResult, DecomposedAction } from '../utils/taskDecomposer';

export type DecomposeStep = 'idle' | 'processing' | 'preview' | 'purpose' | 'error';

export interface UseDecomposeReturn {
  step: DecomposeStep;
  result: DecomposeResult | null;
  actions: DecomposedAction[];
  errorMessage: string;
  startText: (input: string, existingTags: string[]) => Promise<void>;
  startImage: (base64: string, mediaType: string, existingTags: string[]) => Promise<void>;
  updateAction: (index: number, action: DecomposedAction) => void;
  addAction: () => void;
  removeAction: (index: number) => void;
  proceedToPurpose: () => void;
  reset: () => void;
}

export function useDecompose(): UseDecomposeReturn {
  const [step, setStep] = useState<DecomposeStep>('idle');
  const [result, setResult] = useState<DecomposeResult | null>(null);
  const [actions, setActions] = useState<DecomposedAction[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleResult = (r: DecomposeResult) => {
    setResult(r);
    setActions(r.actions);
    setStep('preview');
  };

  const startText = async (input: string, existingTags: string[]) => {
    setStep('processing');
    setErrorMessage('');
    try {
      const r = await decomposeText(input, existingTags);
      handleResult(r);
    } catch {
      setErrorMessage('AI処理に失敗しました。手動でタスクを入力してください。');
      setStep('error');
    }
  };

  const startImage = async (base64: string, mediaType: string, existingTags: string[]) => {
    setStep('processing');
    setErrorMessage('');
    try {
      const r = await decomposeImage(base64, mediaType, existingTags);
      handleResult(r);
    } catch {
      setErrorMessage('画像の処理に失敗しました。手動でタスクを入力してください。');
      setStep('error');
    }
  };

  const updateAction = (index: number, action: DecomposedAction) => {
    setActions((prev) => prev.map((a, i) => (i === index ? action : a)));
  };

  const addAction = () => {
    setActions((prev) => [
      ...prev,
      { title: '', estimatedMinutes: 30, priority: 'medium', tags: [] },
    ]);
  };

  const removeAction = (index: number) => {
    setActions((prev) => prev.filter((_, i) => i !== index));
  };

  const proceedToPurpose = () => setStep('purpose');

  const reset = () => {
    setStep('idle');
    setResult(null);
    setActions([]);
    setErrorMessage('');
  };

  return {
    step, result, actions, errorMessage,
    startText, startImage,
    updateAction, addAction, removeAction,
    proceedToPurpose, reset,
  };
}
