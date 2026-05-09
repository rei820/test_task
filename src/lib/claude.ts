const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export interface ImageContent {
  type: 'image';
  source: { type: 'base64'; media_type: string; data: string };
}

export interface TextContent {
  type: 'text';
  text: string;
}

export type ContentBlock = TextContent | ImageContent;

export async function callClaude(
  systemPrompt: string,
  userContent: string | ContentBlock[],
): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string;
  if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY is not set');

  const content: ContentBlock[] =
    typeof userContent === 'string'
      ? [{ type: 'text', text: userContent }]
      : userContent;

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err}`);
  }

  const json = await res.json() as { content: { type: string; text: string }[] };
  return json.content.find((b) => b.type === 'text')?.text ?? '';
}
