import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const MODEL = process.env.AI_MODEL || 'gemini-2.5-flash';

interface ExtractedQuestion {
  moduleId: string | null;
  question: string;
  marks: number;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GOOGLE_API_KEY is not configured' }, { status: 500 });
  }

  let body: { imageBase64: string; mimeType: string; year: string; modules: Array<{ id: string; name: string }> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { imageBase64, mimeType, year, modules } = body;
  if (!imageBase64 || !mimeType) {
    return NextResponse.json({ error: 'imageBase64 and mimeType are required' }, { status: 400 });
  }

  const moduleList = modules.length
    ? modules.map(m => `  - ID "${m.id}": ${m.name}`).join('\n')
    : '  (no modules defined — use null for all questions)';

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: MODEL,
    config: {
      thinkingConfig: {
        thinkingBudget: -1,
      },
    },
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: { mimeType, data: imageBase64 },
          },
          {
            text: `Extract all questions from this ${year} exam paper image.

Available modules:
${moduleList}

For every question:
1. Extract the COMPLETE question text (include sub-parts if any)
2. Find the marks assigned (look for patterns like "[10]", "10 marks", "(10)", "10 M")
3. Classify which module it belongs to by matching topic keywords — use the exact module ID string
4. If a question does not fit any module, use null for moduleId

Return ONLY a valid JSON object — no markdown, no explanation, no code fences:
{"questions": [
  {"moduleId": "m1", "question": "Full question text here.", "marks": 10},
  {"moduleId": null, "question": "Question that doesn't fit a module.", "marks": 4}
]}`,
          },
        ],
      },
    ],
  });

  const text = response.text ?? '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    return NextResponse.json({ questions: [] });
  }

  try {
    const parsed = JSON.parse(match[0]) as { questions?: ExtractedQuestion[] };
    const questions = Array.isArray(parsed.questions) ? parsed.questions : [];
    return NextResponse.json({ questions });
  } catch {
    return NextResponse.json({ questions: [] });
  }
}
