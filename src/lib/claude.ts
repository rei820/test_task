const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

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
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY is not set');

  const parts: object[] =
    typeof userContent === 'string'
      ? [{ text: userContent }]
      : userContent.map((block) => {
          if (block.type === 'image') {
            return {
              inlineData: {
                mimeType: block.source.media_type,
                data: block.source.data,
              },
            };
          }
          return { text: block.text };
        });

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts }],
      generationConfig: { maxOutputTokens: 2048 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const json = await res.json() as {
    candidates: { content: { parts: { text: string }[] } }[];
  };
  return json.candidates[0]?.content?.parts[0]?.text ?? '';
}
