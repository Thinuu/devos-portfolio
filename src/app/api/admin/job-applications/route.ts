import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/firebase/auth';
import { listJobApplications, savePrivateDocument } from '@/lib/repositories/career.repository';
import { jobApplicationSchema } from '@/lib/schemas/career.schema';
export const runtime = 'nodejs';
export async function GET() { try { await requireAdmin(); return NextResponse.json({ items: await listJobApplications() }); } catch { return NextResponse.json({ error: 'Administrator access required.' }, { status: 401 }); } }
export async function PUT(request: Request) { try { const admin = await requireAdmin(); const parsed = jobApplicationSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: 'Invalid job application.' }, { status: 422 }); await savePrivateDocument('job_applications', parsed.data, admin.uid); return NextResponse.json({ item: parsed.data }); } catch { return NextResponse.json({ error: 'Unable to save application.' }, { status: 500 }); } }
