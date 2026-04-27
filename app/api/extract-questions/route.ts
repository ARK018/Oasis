import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import type { Module, Question } from '@/lib/types';

const NEBIUS_MODEL = process.env.NEBIUS_MODEL || 'Qwen/Qwen2.5-VL-72B-Instruct';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

interface ExtractedQuestion {
  moduleId: string | null;
  question: string;
  marks: number;
}

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
      max_tokens: 8192,
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
  let body: {
    images: Array<{ base64: string; mimeType: string }>;
    year: string;
    subjectId: string;
    filename: string;
    sizeMB: number;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { images, year, subjectId, filename, sizeMB } = body;
  if (!images?.length || !subjectId) {
    return NextResponse.json({ error: 'images and subjectId are required' }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db('oasis');
  const subject = await db.collection('subjects').findOne({ _id: new ObjectId(subjectId) });
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
  }

  const modules: Module[] = subject.modules || [];
  const syllabusContext = modules.length
    ? JSON.stringify(modules.map(m => ({ id: m.id, name: m.name, topics: m.topics || [] })), null, 2)
    : '(no syllabus available — use null for all questions)';

  const prompt = `Extract all questions from this ${year} exam paper${images.length > 1 ? ` (${images.length} pages)` : ''}.

Here is the complete syllabus for this subject — use it to accurately classify each question into the correct module:
${syllabusContext}

CRITICAL RULES for extraction:

1. SUB-QUESTIONS MUST BE SPLIT: If a question has sub-parts (a, b, c, d… or i, ii, iii… or 1, 2, 3…), create a SEPARATE entry for EACH sub-part. Never merge multiple sub-questions into one entry.
   - "Q1 a. Explain X  b. Explain Y  c. Explain Z" → THREE separate entries: "1a. Explain X", "1b. Explain Y", "1c. Explain Z"

2. CLASSIFY EACH SUB-QUESTION INDEPENDENTLY: Even if sub-parts belong to the same question number, each sub-part covers a different topic and must be matched to its own module separately.

3. MARKS PER SUB-QUESTION: Look for marks next to each sub-part (e.g. "[5]", "5 marks"). If marks are only given for the whole question, divide equally among sub-parts.

4. MODULE MATCHING: Compare the topic of each individual sub-question against the module names and topics list. Use the exact module ID string (e.g. "m1", "m2"). Use null only if no module fits.

5. QUESTION TEXT: Include the question number/letter prefix (e.g. "1a.", "Q2b.") in the question text so it can be identified.

Return ONLY a valid JSON object — no markdown, no explanation, no code fences:
{"questions": [
  {"moduleId": "m1", "question": "1a. Explain the concept of a distributed ledger and its significance in blockchain technology.", "marks": 4},
  {"moduleId": "m2", "question": "1b. Explain the Unspent Transaction Output in Bitcoin.", "marks": 4},
  {"moduleId": "m3", "question": "1c. What are Ethereum Wallets? How are Ethereum accounts created using Metamask?", "marks": 4}
]}`;

  let text: string;
  try {
    text = await extractText(images, prompt);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'AI provider error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const jsonStr = extractJSON(text, 'questions');
  if (!jsonStr) {
    return NextResponse.json({ questions: [] });
  }

  let extracted: ExtractedQuestion[];
  try {
    const parsed = JSON.parse(jsonStr);
    extracted = Array.isArray(parsed.questions) ? parsed.questions : [];
  } catch {
    return NextResponse.json({ questions: [] });
  }

  const validModuleIds = new Set(modules.map(m => m.id));
  const existingQuestions: Question[] = subject.questions || [];
  const perMod: Record<string, number> = {};
  existingQuestions.forEach(q => {
    const k = q.module || '__';
    perMod[k] = (perMod[k] || 0) + 1;
  });

  const newQuestions: Question[] = extracted.map(q => {
    const moduleId = q.moduleId && validModuleIds.has(q.moduleId) ? q.moduleId : null;
    const k = moduleId || '__';
    perMod[k] = (perMod[k] || 0) + 1;
    return {
      id: `q_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      module: moduleId,
      question: q.question,
      marks: q.marks || 0,
      year,
      sr: perMod[k],
    };
  });

  const newPaper = {
    id: `p_${Date.now()}`,
    year,
    filename,
    uploadedAt: new Date().toISOString().slice(0, 10),
    sizeMB,
  };

  await db.collection('subjects').updateOne(
    { _id: new ObjectId(subjectId) },
    {
      $push: {
        papers: newPaper as any,
        questions: { $each: newQuestions } as any,
      },
    }
  );

  return NextResponse.json({ questions: newQuestions, paper: newPaper });
}
