import { type NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { CvProfile } from '@/lib/schemas/career.schema';

const CV_DIR = join(process.cwd(), 'data', 'cv');

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const srcPath = join(CV_DIR, `${id}.json`);
  if (!existsSync(srcPath)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const raw = await readFile(srcPath, 'utf8');
  const srcProfile = JSON.parse(raw) as CvProfile;
  const newId = uuidv4().replace(/-/g, '').slice(0, 24);
  const copy: CvProfile = {
    ...srcProfile,
    id: newId,
    name: `${srcProfile.name} (Copy)`,
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await writeFile(join(CV_DIR, `${newId}.json`), JSON.stringify(copy, null, 2));
  return NextResponse.json({ profile: copy }, { status: 201 });
}
