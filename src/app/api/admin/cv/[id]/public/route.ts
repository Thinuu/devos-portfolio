import { type NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import type { CvProfile } from '@/lib/schemas/career.schema';

const CV_DIR = join(process.cwd(), 'data', 'cv');

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const filePath = join(CV_DIR, `${id}.json`);
  if (!existsSync(filePath)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const raw = await readFile(filePath, 'utf8');
  const profile = JSON.parse(raw) as CvProfile;
  profile.isPublic = true;
  profile.updatedAt = new Date().toISOString();
  await writeFile(filePath, JSON.stringify(profile, null, 2));
  return NextResponse.json({ profile });
}
