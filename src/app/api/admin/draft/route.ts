import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/firebase/auth';
import { getDraftRelease, saveDraft } from '@/lib/repositories/portfolio.repository';
import { releaseSchema } from '@/lib/schemas/portfolio.schema';
import { getFirebaseAdmin } from '@/lib/firebase/admin';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json(await getDraftRelease());
  } catch {
    return NextResponse.json({ error: 'Administrator access required.' }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin();
    const text = await request.text();
    if (!text.trim()) return NextResponse.json({ error: 'Draft payload is empty.' }, { status: 400 });
    let body: unknown;
    try { body = JSON.parse(text); } catch { return NextResponse.json({ error: 'Draft payload is not valid JSON.' }, { status: 400 }); }
    const parsed = releaseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Draft validation failed.', issues: parsed.error.issues }, { status: 422 });
    }
    await saveDraft(parsed.data as unknown as Parameters<typeof saveDraft>[0], admin.uid);
    await getFirebaseAdmin().db.collection('activity').add({
      type: 'draft.save',
      uid: admin.uid,
      createdAt: new Date(),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to save draft.' }, { status: 500 });
  }
}
