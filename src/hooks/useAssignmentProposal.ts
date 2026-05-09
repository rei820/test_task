import { useState } from 'react';
import { callClaude } from '../lib/claude';
import type { Task, Member } from '../types/task';

export interface Proposal {
  taskId: string;
  memberId: string;
  reason: string;
  task: Task;
  member: Member;
}

export type ProposalStep = 'idle' | 'loading' | 'ready' | 'error';

const SYSTEM_PROMPT = `あなたはタスク管理アシスタントです。未割り当てタスクを分析し、最適な担当者を提案してください。

判断基準（優先順）:
1. タスクのタグと担当者の過去タグの一致度
2. 担当者の現在の未完了タスク数（少ない人を優先）
3. タスクの優先度（高優先度は余裕のある人へ）

必ず有効なJSONのみを返す（説明文不要）。

出力フォーマット:
[
  { "task_id": string, "member_id": string, "reason": string }
]`;

function buildUserMessage(unassigned: Task[], members: Member[], allTasks: Task[]): string {
  const memberSummaries = members.map((m) => {
    const memberTasks = allTasks.filter((t) => t.assigneeId === m.id && !t.archived && t.status !== 'done');
    const tagCounts: Record<string, number> = {};
    allTasks.filter((t) => t.assigneeId === m.id).forEach((t) => {
      t.tags.forEach((tag) => { tagCounts[tag] = (tagCounts[tag] ?? 0) + 1; });
    });
    const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t);
    return `- ${m.name} (id:${m.id}): 未完了${memberTasks.length}件, よく使うタグ: [${topTags.join(', ') || 'なし'}]`;
  });

  const taskList = unassigned.map((t) =>
    `- "${t.title}" (id:${t.id}, priority:${t.priority}, tags:[${t.tags.join(', ')}])`
  );

  return `未割り当てタスク:\n${taskList.join('\n')}\n\nメンバー状況:\n${memberSummaries.join('\n')}`;
}

export function useAssignmentProposal(
  tasks: Task[],
  members: Member[],
  updateTask: (id: string, data: Partial<Task>) => Promise<void>,
) {
  const [step, setStep] = useState<ProposalStep>('idle');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const generate = async () => {
    const unassigned = tasks.filter((t) => !t.assigneeId && !t.archived && t.status !== 'done');
    if (unassigned.length === 0) {
      setErrorMessage('未割り当てタスクがありません。');
      setStep('error');
      return;
    }

    setStep('loading');
    setErrorMessage('');
    try {
      const message = buildUserMessage(unassigned, members, tasks);
      const text = await callClaude(SYSTEM_PROMPT, message);
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array in response');

      const raw = JSON.parse(jsonMatch[0]) as { task_id: string; member_id: string; reason: string }[];
      const resolved: Proposal[] = raw.flatMap((r) => {
        const task = tasks.find((t) => t.id === r.task_id);
        const member = members.find((m) => m.id === r.member_id);
        if (!task || !member) return [];
        return [{ taskId: r.task_id, memberId: r.member_id, reason: r.reason, task, member }];
      });

      setProposals(resolved);
      setStep('ready');
    } catch (e) {
      console.error('[AssignmentProposal] error:', e);
      setErrorMessage(`提案の生成に失敗しました: ${e instanceof Error ? e.message : String(e)}`);
      setStep('error');
    }
  };

  const approve = async (taskId: string, memberId: string) => {
    await updateTask(taskId, { assigneeId: memberId });
    setProposals((prev) => prev.filter((p) => p.taskId !== taskId));
  };

  const approveAll = async () => {
    for (const p of proposals) {
      await updateTask(p.taskId, { assigneeId: p.memberId });
    }
    setProposals([]);
    setStep('idle');
  };

  const reset = () => {
    setStep('idle');
    setProposals([]);
    setErrorMessage('');
  };

  return { step, proposals, errorMessage, generate, approve, approveAll, reset };
}
