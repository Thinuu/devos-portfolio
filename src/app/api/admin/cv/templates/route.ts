import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/firebase/auth';
import {
  saveUploadedTemplate,
  listUploadedTemplates,
  deleteUploadedTemplate,
  logCvActivity,
} from '@/lib/repositories/career.repository';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await requireAdmin();
    const templates = await listUploadedTemplates();
    return NextResponse.json({ templates });
  } catch {
    return NextResponse.json({ error: 'Administrator access required.' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const name = (formData.get('name') as string) || (file?.name.replace(/\.[^/.]+$/, '') ?? 'Custom Word Template');

    if (!file) {
      return NextResponse.json({ error: 'No template file uploaded.' }, { status: 400 });
    }

    if (!file.name.endsWith('.docx')) {
      return NextResponse.json({ error: 'Template must be a .docx file.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const id = `tpl-${Date.now().toString(36)}`;

    await saveUploadedTemplate(id, name, file.name, buffer);
    await logCvActivity('cv-template-uploaded', { id, name, filename: file.name }, admin.uid);

    return NextResponse.json({ id, name, filename: file.name }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to upload template.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Template ID required.' }, { status: 400 });
    }

    await deleteUploadedTemplate(id);
    await logCvActivity('cv-template-deleted', { id }, admin.uid);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to delete template.' }, { status: 500 });
  }
}
