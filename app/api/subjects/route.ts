import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  const client = await clientPromise;
  const db = client.db('oasis');
  const subjects = await db.collection('subjects').find({}).sort({ createdAt: -1 }).toArray();
  return NextResponse.json(
    subjects.map(({ _id, ...s }) => ({ ...s, id: _id.toString() }))
  );
}

export async function POST(request: NextRequest) {
  const { name, code, color } = await request.json();
  const client = await clientPromise;
  const db = client.db('oasis');
  const result = await db.collection('subjects').insertOne({
    name,
    code,
    color,
    syllabusUploaded: false,
    modules: [],
    papers: [],
    questions: [],
    createdAt: new Date(),
  });
  return NextResponse.json({ id: result.insertedId.toString() });
}
