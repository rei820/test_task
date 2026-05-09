import { callClaude } from '../lib/claude';
import type { ContentBlock } from '../lib/claude';
import type { TaskPriority } from '../types/task';

export interface DecomposedAction {
  title: string;
  estimatedMinutes: number;
  priority: TaskPriority;
  tags: string[];
}

export interface DecomposeResult {
  shouldDecompose: boolean;
  actions: DecomposedAction[];
  purposeSuggestions: string[];
  tagSuggestions: string[];
}

const SYSTEM_PROMPT = `あなたはタスク管理アシスタントです。ユーザーが入力したタスクを分析し、以下のJSONを返してください。

ルール:
- 所要時間が30分を超えると推定される複雑なタスクは should_decompose: true にし、3〜5のアクションに分解する
- 「水を買う」のような単純なタスクは should_decompose: false にし、actions は1件のみ
- 各アクションは「動詞＋目的語」の形式（例: 「競合他社の料金を調査する」）
- priority は "high" / "medium" / "low" のいずれか
- estimated_minutes は 15/30/45/60/90/120 のいずれか
- purpose_suggestions は3つ、目的を端的に表す日本語フレーズ
- tag_suggestions は既存タグリストから関連するものを最大2件選ぶ（なければ空配列）
- 必ず有効なJSONのみを返す（説明文不要）

出力フォーマット:
{
  "should_decompose": boolean,
  "actions": [
    { "title": string, "estimated_minutes": number, "priority": string, "tags": string[] }
  ],
  "purpose_suggestions": [string, string, string],
  "tag_suggestions": [string]
}`;

function parseResult(text: string): DecomposeResult {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in response');

  const raw = JSON.parse(jsonMatch[0]) as {
    should_decompose: boolean;
    actions: { title: string; estimated_minutes: number; priority: string; tags?: string[] }[];
    purpose_suggestions: string[];
    tag_suggestions: string[];
  };

  return {
    shouldDecompose: raw.should_decompose,
    actions: raw.actions.map((a) => ({
      title: a.title,
      estimatedMinutes: a.estimated_minutes,
      priority: (a.priority as TaskPriority) ?? 'medium',
      tags: a.tags ?? [],
    })),
    purposeSuggestions: raw.purpose_suggestions ?? [],
    tagSuggestions: raw.tag_suggestions ?? [],
  };
}

export async function decomposeText(
  input: string,
  existingTags: string[],
): Promise<DecomposeResult> {
  const userMessage = `既存タグ: ${existingTags.join(', ') || 'なし'}\n\nタスク: ${input}`;
  const text = await callClaude(SYSTEM_PROMPT, userMessage);
  return parseResult(text);
}

export async function decomposeImage(
  base64Data: string,
  mediaType: string,
  existingTags: string[],
): Promise<DecomposeResult> {
  const content: ContentBlock[] = [
    {
      type: 'image',
      source: { type: 'base64', media_type: mediaType, data: base64Data },
    },
    {
      type: 'text',
      text: `この画像からタスクを抽出・分解してください。既存タグ: ${existingTags.join(', ') || 'なし'}`,
    },
  ];
  const text = await callClaude(SYSTEM_PROMPT, content);
  return parseResult(text);
}
