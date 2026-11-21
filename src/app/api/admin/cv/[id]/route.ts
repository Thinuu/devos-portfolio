import { type NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import type { CvProfile } from '@/lib/schemas/career.schema';

const CV_DIR = join(process.cwd(), 'data', 'cv');

async function getProfile(id: string): Promise<CvProfile | null> {
  const filePath = join(CV_DIR, `${id}.json`);
  if (!existsSync(filePath)) return null;
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw) as CvProfile;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const profile = await getProfile(id);
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ profile });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name } = (await req.json()) as { name?: string };
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });
  const profile = await getProfile(id);
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  profile.name = name.trim();
  profile.updatedAt = new Date().toISOString();
  await writeFile(join(CV_DIR, `${id}.json`), JSON.stringify(profile, null, 2));
  return NextResponse.json({ profile });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const filePath = join(CV_DIR, `${id}.json`);
  if (!existsSync(filePath)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await unlink(filePath);
  return new NextResponse(null, { status: 204 });
}
