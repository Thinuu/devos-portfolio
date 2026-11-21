import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/firebase/auth';
import { getDraftDesign, saveDraftDesign } from '@/lib/repositories/design.repository';
import { designConfigSchema } from '@/lib/schemas/design.schema';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({ config: await getDraftDesign() });
  } catch {
    return NextResponse.json({ error: 'Administrator access required.' }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin();
    const text = await request.text();
    if (!text.trim()) return NextResponse.json({ error: 'Design draft payload is empty.' }, { status: 400 });
    let body: unknown;
    try { body = JSON.parse(text); } catch { return NextResponse.json({ error: 'Design draft is not valid JSON.' }, { status: 400 }); }
    const parsed = designConfigSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid design configuration.', issues: parsed.error.issues }, { status: 422 });
    return NextResponse.json({ config: await saveDraftDesign(parsed.data, admin.uid) });
  } catch {
    return NextResponse.json({ error: 'Unable to save design draft.' }, { status: 500 });
  }
}
