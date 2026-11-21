import { type NextRequest, NextResponse } from 'next/server';
import { listCvProfiles, createCvProfile } from '@/lib/repositories/cv.repository';

export async function GET(_req: NextRequest) {
  try {
    const profiles = await listCvProfiles();
    return NextResponse.json({ profiles });
  } catch (err) {
    console.error('CV list error:', err);
    return NextResponse.json({ error: 'Failed to load CV profiles' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, mode, targetTitle, company } = (await req.json()) as {
      name: string;
      mode: 'portfolio' | 'blank';
      targetTitle?: string;
      company?: string;
    };
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const profile = await createCvProfile({
      name: name.trim(),
      mode,
      targetTitle: targetTitle?.trim(),
      company: company?.trim(),
    });
    return NextResponse.json({ profile }, { status: 201 });
  } catch (err) {
    console.error('CV create error:', err);
    return NextResponse.json({ error: 'Failed to create CV profile' }, { status: 500 });
  }
}
