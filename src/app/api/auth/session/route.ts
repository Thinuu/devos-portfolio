import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { cookieName } from '@/lib/firebase/auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const text = await request.text();
    if (!text.trim()) return NextResponse.json({ error: 'A valid sign-in token is required.' }, { status: 400 });
    let body: unknown;
    try { body = JSON.parse(text); } catch { return NextResponse.json({ error: 'Sign-in payload is not valid JSON.' }, { status: 400 }); }
    const { idToken } = body as { idToken?: string };
    if (!idToken || idToken.length > 10000) {
      return NextResponse.json({ error: 'A valid sign-in token is required.' }, { status: 400 });
    }

    const auth = getAuth(getFirebaseAdmin().app);
    const decoded = await auth.verifyIdToken(idToken);
    if (decoded.admin !== true && decoded.role !== 'admin') {
      return NextResponse.json({ error: 'This account is not an administrator.' }, { status: 403 });
    }
    const allowlist = (process.env.ADMIN_UID_ALLOWLIST || process.env.ADMIN_EMAIL_ALLOWLIST || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    const uidOrEmailAllowed = allowlist.length === 0
      || allowlist.includes(decoded.uid)
      || (typeof decoded.email === 'string' && allowlist.includes(decoded.email));
    if (!uidOrEmailAllowed) {
      return NextResponse.json({ error: 'This account is not on the administrator allowlist.' }, { status: 403 });
    }

    const session = await auth.createSessionCookie(idToken, { expiresIn: 1000 * 60 * 60 * 8 });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(cookieName, session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Unable to create an administrator session.' }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(cookieName);
  return response;
}
