import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { cookieName } from '@/lib/firebase/auth';
import {
  checkLoginRateLimit,
  recordFailedLogin,
  clearLoginRateLimit,
  getClientIp,
} from '@/lib/auth/rate-limit';

export const runtime = 'nodejs';

const GENERIC_ERROR = 'Email or password is incorrect';

export async function POST(request: Request) {
  const ip = getClientIp(request);

  // Check rate limit before processing
  const initialRateStatus = checkLoginRateLimit(ip);
  if (initialRateStatus.blocked) {
    return NextResponse.json(
      { error: initialRateStatus.errorMessage, blocked: true },
      { status: 429 }
    );
  }

  let idToken: string | undefined;
  let remember = false;

  try {
    const text = await request.text();
    if (!text.trim()) {
      recordFailedLogin(ip);
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
    }

    try {
      const parsed = JSON.parse(text);
      idToken = parsed.idToken;
      remember = Boolean(parsed.remember);
    } catch {
      recordFailedLogin(ip);
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
    }

    if (!idToken || typeof idToken !== 'string' || idToken.length > 10000) {
      recordFailedLogin(ip);
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
    }

    const auth = getAuth(getFirebaseAdmin().app);
    let decoded;
    try {
      decoded = await auth.verifyIdToken(idToken);
    } catch {
      const rateStatus = recordFailedLogin(ip);
      if (rateStatus.blocked) {
        return NextResponse.json({ error: rateStatus.errorMessage, blocked: true }, { status: 429 });
      }
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    const email = typeof decoded.email === 'string' ? decoded.email : null;

    // Check rate limit with decoded email
    const emailRateStatus = checkLoginRateLimit(ip, email);
    if (emailRateStatus.blocked) {
      return NextResponse.json(
        { error: emailRateStatus.errorMessage, blocked: true },
        { status: 429 }
      );
    }

    // Verify admin role/claim
    const isAdmin = decoded.admin === true || decoded.role === 'admin';
    if (!isAdmin) {
      const rateStatus = recordFailedLogin(ip, email);
      if (rateStatus.blocked) {
        return NextResponse.json({ error: rateStatus.errorMessage, blocked: true }, { status: 429 });
      }
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    // Verify allowlist if configured
    const allowlist = (process.env.ADMIN_UID_ALLOWLIST || process.env.ADMIN_EMAIL_ALLOWLIST || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    const uidOrEmailAllowed = allowlist.length === 0
      || allowlist.includes(decoded.uid)
      || (email !== null && allowlist.includes(email));

    if (!uidOrEmailAllowed) {
      const rateStatus = recordFailedLogin(ip, email);
      if (rateStatus.blocked) {
        return NextResponse.json({ error: rateStatus.errorMessage, blocked: true }, { status: 429 });
      }
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    // Successful authentication - clear rate limit for this IP and email
    clearLoginRateLimit(ip, email);

    // Session lifetime: 14 days if remember is checked, 1 day (24 hours) otherwise
    const expiresIn = remember
      ? 1000 * 60 * 60 * 24 * 14
      : 1000 * 60 * 60 * 24;
    const maxAge = remember
      ? 60 * 60 * 24 * 14
      : 60 * 60 * 24;

    const session = await auth.createSessionCookie(idToken, { expiresIn });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(cookieName, session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    return response;
  } catch {
    const rateStatus = recordFailedLogin(ip);
    if (rateStatus.blocked) {
      return NextResponse.json({ error: rateStatus.errorMessage, blocked: true }, { status: 429 });
    }
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(cookieName);
  return response;
}
