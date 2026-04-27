import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

const NEBIUS_MODEL = process.env.NEBIUS_MODEL || 'Qwen/Qwen2.5-VL-72B-Instruct';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

async function extractText(images: Array<{ base64: string; mimeType: string }>, prompt: string): Promise<string> {
  const nebiusKey = process.env.NEBIUS_API_KEY;
  const googleKey = process.env.GOOGLE_API_KEY;

  if (nebiusKey) {
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey: nebiusKey, baseURL: 'https://api.studio.nebius.ai/v1/' });

    const imageContent = images.map(img => ({
      type: 'image_url' as const,
      image_url: { url: `data:${img.mimeType};base64,${img.base64}` },
    }));

    const res = await client.chat.completions.create({
      model: NEBIUS_MODEL,
      messages: [{ role: 'user', content: [...imageContent, { type: 'text', text: prompt }] }],
      max_tokens: 4096,
    });
    return res.choices[0]?.message?.content ?? '';
  }

  if (googleKey) {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: googleKey });
    const imageParts = images.map(img => ({ inlineData: { mimeType: img.mimeType, data: img.base64 } }));
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      config: { thinkingConfig: { thinkingBudget: 0 } },
      contents: [{ role: 'user', parts: [...imageParts, { text: prompt }] }],
    });
    return response.text ?? '';
  }

  throw new Error('No AI provider configured. Set NEBIUS_API_KEY or GOOGLE_API_KEY.');
}

function extractJSON(text: string, key: string): string | null {
  const cleaned = text.replace(/```(?:json)?\s*/g, '').trim();
  const anchor = cleaned.match(new RegExp(`\\{\\s*"${key}"\\s*:`));
  const start = anchor?.index ?? cleaned.indexOf('{');
  if (start < 0) return null;
  const match = cleaned.slice(start).match(/\{[\s\S]*\}/);
  return match?.[0] ?? null;
}

export async function POST(request: NextRequest) {
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

  const prompt = `Analyze ${images.length > 1 ? `these ${images.length} syllabus pages` : 'this syllabus'} and extract all modules/units with their topics and subtopics.

Return ONLY a valid JSON object — no markdown, no explanation, no code fences:
{"modules": [{"name": "Module 1 – Topic Name", "topics": ["Topic 1", "Topic 2", "Topic 3"]}]}

Rules:
- Use the exact module names as they appear in the syllabus
- Include the module number prefix if present
- List every topic and subtopic under each module
- Topics should be concise but complete`;

  let text: string;
  try {
    text = await extractText(images, prompt);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'AI provider error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const jsonStr = extractJSON(text, 'modules');
  if (!jsonStr) {
    return NextResponse.json({ error: 'Could not extract syllabus data' }, { status: 422 });
  }

  let rawModules: Array<{ name: string; topics: string[] }>;
  try {
    const parsed = JSON.parse(jsonStr);
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
