import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/firebase/auth';
import { listCoverLetters, savePrivateDocument } from '@/lib/repositories/career.repository';
import { coverLetterSchema } from '@/lib/schemas/career.schema';
export const runtime = 'nodejs';
export async function GET() { try { await requireAdmin(); return NextResponse.json({ items: await listCoverLetters() }); } catch { return NextResponse.json({ error: 'Administrator access required.' }, { status: 401 }); } }
export async function PUT(request: Request) { try { const admin = await requireAdmin(); const parsed = coverLetterSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: 'Invalid cover letter.' }, { status: 422 }); await savePrivateDocument('cover_letters', parsed.data, admin.uid); return NextResponse.json({ item: parsed.data }); } catch { return NextResponse.json({ error: 'Unable to save cover letter.' }, { status: 500 }); } }
