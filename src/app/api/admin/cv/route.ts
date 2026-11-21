import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/firebase/auth';
import { listCvProfiles, saveCvProfile } from '@/lib/repositories/career.repository';
import { cvProfileSchema } from '@/lib/schemas/career.schema';

export const runtime = 'nodejs';

export async function GET() {
  try { await requireAdmin(); return NextResponse.json({ profiles: await listCvProfiles() }); }
  catch { return NextResponse.json({ error: 'Administrator access required.' }, { status: 401 }); }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin();
    const parsed = cvProfileSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid CV profile.', issues: parsed.error.issues }, { status: 422 });
    return NextResponse.json({ profile: await saveCvProfile(parsed.data, admin.uid) });
  } catch { return NextResponse.json({ error: 'Unable to save CV profile.' }, { status: 500 }); }
}
