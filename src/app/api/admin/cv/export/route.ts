import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/firebase/auth';
import { listCvProfiles } from '@/lib/repositories/career.repository';
import { createDocx, createPdf } from '@/lib/career/document';
import { cvProfileSchema } from '@/lib/schemas/career.schema';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const profile = cvProfileSchema.parse(body.profile ?? (await listCvProfiles())[0]);
    const format = body.format === 'pdf' ? 'pdf' : 'docx';
    const buffer = format === 'pdf' ? await createPdf(profile) : await createDocx(profile);
    const filename = `${profile.name.replace(/[^a-z0-9]+/gi, '_')}_CV.${format}`;
    return new NextResponse(new Uint8Array(buffer), {
      headers: { 'Content-Type': format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Content-Disposition': `attachment; filename="${filename}"` },
    });
  } catch { return NextResponse.json({ error: 'Unable to generate the CV document.' }, { status: 500 }); }
}
