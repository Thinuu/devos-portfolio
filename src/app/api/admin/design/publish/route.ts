import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/firebase/auth';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { publishDraftDesign } from '@/lib/repositories/design.repository';
import { designConfigSchema } from '@/lib/schemas/design.schema';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await requireAdmin();
    const { getPublishedDesign } = await import('@/lib/repositories/design.repository');
    return NextResponse.json({ config: await getPublishedDesign() });
  } catch {
    return NextResponse.json({ error: 'Administrator access required.' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const parsed = designConfigSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid design configuration.', issues: parsed.error.issues }, { status: 422 });
    const config = await publishDraftDesign(parsed.data, admin.uid);
    await getFirebaseAdmin().db.collection('activity').add({
      type: 'design.publish',
      uid: admin.uid,
      presetId: config.presetId,
      createdAt: new Date(),
    });
    revalidatePath('/');
    revalidatePath('/projects', 'layout');
    return NextResponse.json({ ok: true, publishedAt: new Date().toISOString(), config });
  } catch {
    return NextResponse.json({ error: 'Unable to publish design.' }, { status: 500 });
  }
}
