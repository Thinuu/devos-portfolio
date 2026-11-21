import { type NextRequest, NextResponse } from 'next/server';
import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import type { CvProfile } from '@/lib/schemas/career.schema';

const CV_DIR = join(process.cwd(), 'data', 'cv');

async function ensureDir() {
  if (!existsSync(CV_DIR)) await mkdir(CV_DIR, { recursive: true });
}

export async function GET(_req: NextRequest) {
  await ensureDir();
  const files = await readdir(CV_DIR);
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const raw = await readFile(join(CV_DIR, file), 'utf8');
    const profile = JSON.parse(raw) as CvProfile;
    if (profile.isPublic) {
      return NextResponse.json({
        publicProfile: profile,
        publicUrl: `/public-cv/${profile.id}.pdf`,
        fileStats: null,
      });
    }
  }
  return NextResponse.json({ publicProfile: null, publicUrl: '', fileStats: null });
}

export async function POST(req: NextRequest) {
  const { cvId } = (await req.json()) as { cvId?: string };
  if (!cvId) return NextResponse.json({ error: 'cvId required' }, { status: 400 });
  await ensureDir();
  const files = await readdir(CV_DIR);
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const filePath = join(CV_DIR, file);
    const raw = await readFile(filePath, 'utf8');
    const profile = JSON.parse(raw) as CvProfile;
    if (profile.isPublic || profile.id === cvId) {
      profile.isPublic = profile.id === cvId;
      await writeFile(filePath, JSON.stringify(profile, null, 2));
    }
  }
  return NextResponse.json({ success: true });
}
