import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const client = await clientPromise;
  const db = client.db('oasis');
  const doc = await db.collection('subjects').findOne({ _id: new ObjectId(id) });
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { _id, ...rest } = doc;
  return NextResponse.json({ ...rest, id: _id.toString() });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { id: _sid, _id, ...update } = body;
  const client = await clientPromise;
  const db = client.db('oasis');
  await db.collection('subjects').updateOne(
    { _id: new ObjectId(id) },
    { $set: update }
  );
  return NextResponse.json({ success: true });
}
