import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/firebase/auth';
import { listExportedDocuments } from '@/lib/repositories/career.repository';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await requireAdmin();
    const documents = await listExportedDocuments();
    return NextResponse.json({ documents });
  } catch {
    return NextResponse.json({ error: 'Administrator access required.' }, { status: 401 });
  }
}
