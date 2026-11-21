import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/firebase/auth';
import { getFirebaseAdmin } from '@/lib/firebase/admin';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Choose an image file.' }, { status: 400 });
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) return NextResponse.json({ error: 'PNG, JPG, and WebP files are supported.' }, { status: 422 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'The image must be 5MB or smaller.' }, { status: 422 });

    const bytes = new Uint8Array(await file.arrayBuffer());
    const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `media/profile/profile-${Date.now()}.${extension}`;
    await getFirebaseAdmin().storage.bucket().file(path).save(Buffer.from(bytes), {
      resumable: false,
      metadata: { contentType: file.type, cacheControl: 'public, max-age=31536000' },
    });
    await getFirebaseAdmin().storage.bucket().file(path).makePublic();
    const baseUrl = `https://storage.googleapis.com/${getFirebaseAdmin().storage.bucket().name}/${path}`;
    return NextResponse.json({ ok: true, url: baseUrl, path });
  } catch {
    return NextResponse.json({ error: 'Unable to upload the image.' }, { status: 500 });
  }
}
