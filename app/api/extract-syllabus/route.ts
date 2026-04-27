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

  let body: { imageBase64: string; mimeType: string; subjectId: string; filename: string; sizeMB: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { imageBase64, mimeType, subjectId, filename, sizeMB } = body;
  if (!imageBase64 || !mimeType || !subjectId) {
    return NextResponse.json({ error: 'imageBase64, mimeType, and subjectId are required' }, { status: 400 });
  }

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
            text: `Analyze this syllabus image and extract all modules/units with their topics and subtopics.

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

  const text = response.text ?? '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
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
