import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

const MODEL = process.env.AI_MODEL || 'gemini-2.5-flash';

export async function POST(request: NextRequest) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GOOGLE_API_KEY is not configured' }, { status: 500 });
  }

  let body: { images: Array<{ base64: string; mimeType: string }>; subjectId: string; filename: string; sizeMB: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { images, subjectId, filename, sizeMB } = body;
  if (!images?.length || !subjectId) {
    return NextResponse.json({ error: 'images and subjectId are required' }, { status: 400 });
  }

  const ai = new GoogleGenAI({ apiKey });

  const imageParts = images.map(img => ({ inlineData: { mimeType: img.mimeType, data: img.base64 } }));

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
          ...imageParts,
          {
            text: `Analyze ${images.length > 1 ? `these ${images.length} syllabus pages` : 'this syllabus'} and extract all modules/units with their topics and subtopics.

Return ONLY a valid JSON object — no markdown, no explanation, no code fences:
{"modules": [{"name": "Module 1 – Topic Name", "topics": ["Topic 1", "Topic 2", "Topic 3"]}]}

Rules:
- Use the exact module names as they appear in the syllabus
- Include the module number prefix if present
- List every topic and subtopic under each module
- Topics should be concise but complete`,
          },
        ],
      },
    ],
  });

  // Log raw response structure for debugging
  const rawParts = response.candidates?.[0]?.content?.parts ?? [];
  console.log('[extract-syllabus] parts count:', rawParts.length);
  rawParts.forEach((p: any, i: number) => {
    console.log(`[extract-syllabus] part[${i}] thought=${p.thought} textLen=${p.text?.length ?? 0} preview=${p.text?.slice(0, 100)}`);
  });

  // Filter out thinking parts — only use the actual response text
  type Part = { text?: string; thought?: boolean };
  const parts = rawParts as Part[];
  let text = parts.filter(p => p.text && !p.thought).map(p => p.text).join('');
  if (!text) {
    try { text = response.text ?? ''; } catch { text = parts.filter(p => p.text).map(p => p.text).join(''); }
  }
  console.log('[extract-syllabus] filtered text length:', text.length, 'preview:', text.slice(0, 200));

  // Strip markdown code fences the model may add despite instructions
  const cleaned = text.replace(/```(?:json)?\s*/g, '').trim();

  // Find JSON start — allow any whitespace between { and "modules" key
  const anchor = cleaned.match(/\{\s*"modules"\s*:/);
  const jsonStart = anchor?.index ?? cleaned.indexOf('{');
  const searchText = jsonStart >= 0 ? cleaned.slice(jsonStart) : cleaned;
  const match = searchText.match(/\{[\s\S]*\}/);
  console.log('[extract-syllabus] jsonStart:', jsonStart, 'matchLen:', match?.[0]?.length ?? 0);
  if (!match) {
    console.error('[extract-syllabus] no JSON match found in cleaned text:', cleaned.slice(0, 500));
    return NextResponse.json({ error: 'Could not extract syllabus data' }, { status: 422 });
  }

  let rawModules: Array<{ name: string; topics: string[] }>;
  try {
    const parsed = JSON.parse(match[0]);
    rawModules = Array.isArray(parsed.modules) ? parsed.modules : [];
  } catch {
    return NextResponse.json({ error: 'Failed to parse extracted syllabus' }, { status: 422 });
  }

  if (!rawModules.length) {
    return NextResponse.json(
      { error: 'No modules detected. Please ensure the image shows a clear syllabus.' },
      { status: 422 }
    );
  }

  const modules = rawModules.map((m, i) => ({
    id: `m${i + 1}`,
    name: m.name,
    topics: Array.isArray(m.topics) ? m.topics : [],
  }));

  const client = await clientPromise;
  const db = client.db('oasis');
  await db.collection('subjects').updateOne(
    { _id: new ObjectId(subjectId) },
    {
      $set: {
        syllabusUploaded: true,
        syllabusFilename: filename,
        syllabusUploadedAt: new Date().toISOString().slice(0, 10),
        syllabusSizeMB: sizeMB,
        modules,
      },
    }
  );

  return NextResponse.json({ modules });
}
