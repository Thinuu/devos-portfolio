import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/firebase/auth';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { getDraftRelease, publishDraft } from '@/lib/repositories/portfolio.repository';
import { releaseSchema } from '@/lib/schemas/portfolio.schema';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await requireAdmin();
    const { getPublishedRelease } = await import('@/lib/repositories/portfolio.repository');
    return NextResponse.json(await getPublishedRelease());
  } catch {
    return NextResponse.json({ error: 'Administrator access required.' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    let release = await getDraftRelease();
    const text = await request.text().catch(() => '');
    let body: unknown = null;
    if (text.trim()) {
      try { body = JSON.parse(text); } catch { return NextResponse.json({ error: 'Publish payload is not valid JSON.' }, { status: 400 }); }
    }
    if (body) {
      const parsed = releaseSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Draft validation failed.', issues: parsed.error.issues }, { status: 422 });
      release = parsed.data as unknown as typeof release;
    }
    const releaseId = await publishDraft(release, admin.uid);
    revalidatePath('/');
    revalidatePath('/projects', 'layout');
    await getFirebaseAdmin().db.collection('activity').add({
      type: 'publish',
      uid: admin.uid,
      releaseId,
      createdAt: new Date(),
    });
    return NextResponse.json({ ok: true, releaseId, publishedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: 'Unable to publish the validated draft.' }, { status: 500 });
  }
}
