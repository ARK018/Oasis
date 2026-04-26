import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const MODEL = process.env.AI_MODEL || 'gemini-2.0-flash';

export async function POST(request: NextRequest) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GOOGLE_API_KEY is not configured' }, { status: 500 });
  }

  let body: { imageBase64: string; mimeType: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { imageBase64, mimeType } = body;
  if (!imageBase64 || !mimeType) {
    return NextResponse.json({ error: 'imageBase64 and mimeType are required' }, { status: 400 });
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        inlineData: { mimeType, data: imageBase64 },
      },
      {
        text: `Analyze this syllabus image and extract all module or unit names in order.

Return ONLY a valid JSON object — no markdown, no explanation, no code fences:
{"modules": ["Module 1 – Topic Name", "Module 2 – Topic Name", "Module 3 – Topic Name"]}

Use the exact module names as they appear in the syllabus. Include the module number prefix if present.`,
      },
    ],
  });

  const text = response.text ?? '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    return NextResponse.json({ modules: [] });
  }

  try {
    const parsed = JSON.parse(match[0]) as { modules?: string[] };
    return NextResponse.json({ modules: Array.isArray(parsed.modules) ? parsed.modules : [] });
  } catch {
    return NextResponse.json({ modules: [] });
  }
}
