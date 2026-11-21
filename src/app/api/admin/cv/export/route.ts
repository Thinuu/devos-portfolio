import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/firebase/auth';
import {
  getCvProfileById,
  recordExportedDocument,
  logCvActivity,
  getUploadedTemplateBuffer,
} from '@/lib/repositories/career.repository';
import {
  createDocx,
  createPdf,
  fillDocxTemplate,
  createStarterDocxTemplate,
} from '@/lib/career/document';
import { cvProfileSchema } from '@/lib/schemas/career.schema';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();

    // Check if downloading starter template
    if (body.starter === true) {
      const buffer = await createStarterDocxTemplate();
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': 'attachment; filename="CV_Template_Starter.docx"',
        },
      });
    }

    // Resolve profile
    let profile = body.profile;
    if (!profile && body.cvId) {
      profile = await getCvProfileById(body.cvId);
    }
    const parsed = cvProfileSchema.parse(profile);

    const format = body.format === 'docx' ? 'docx' : 'pdf';
    const customTemplateId = typeof body.customTemplateId === 'string' ? body.customTemplateId : undefined;

    let buffer: Buffer;

    if (format === 'docx' && customTemplateId) {
      const templateBuffer = await getUploadedTemplateBuffer(customTemplateId);
      if (!templateBuffer) {
        return NextResponse.json({ error: 'Uploaded template not found.' }, { status: 404 });
      }
      buffer = await fillDocxTemplate(templateBuffer, parsed);
    } else if (format === 'docx') {
      buffer = await createDocx(parsed);
    } else {
      buffer = await createPdf(parsed);
    }

    // Generate compliant filename: ThinuUpadya_CV_<target-role>_<YYYY-MM-DD>.pdf/.docx
    const roleSlug = (parsed.targetTitle || 'Software_Engineer')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    const dateStamp = new Date().toISOString().split('T')[0];
    const filename = `ThinuUpadya_CV_${roleSlug}_${dateStamp}.${format}`;

    // Record document to documents list
    await recordExportedDocument({
      filename,
      cvId: parsed.id,
      cvName: parsed.name,
      templateId: customTemplateId ? `custom:${customTemplateId}` : parsed.templateId,
      format,
      sizeBytes: buffer.length,
      createdBy: admin.uid,
    });

    // Log export event
    await logCvActivity('cv-exported', {
      cvId: parsed.id,
      cvName: parsed.name,
      format,
      filename,
    }, admin.uid);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': format === 'pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to generate CV export.' },
      { status: 500 }
    );
  }
}
