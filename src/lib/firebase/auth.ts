import { cookies } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { getFirebaseAdmin } from '@/lib/firebase/admin';

const cookieName = process.env.AUTH_COOKIE_NAME || 'portfolio_session';

export async function requireAdmin() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) throw new Error('Unauthenticated');

  const decoded = await getAuth(getFirebaseAdmin().app).verifySessionCookie(token, true);
  const isAdmin = decoded.admin === true || decoded.role === 'admin';
  const allowlist = (process.env.ADMIN_UID_ALLOWLIST || process.env.ADMIN_EMAIL_ALLOWLIST || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const uidOrEmailAllowed = allowlist.length === 0
    || allowlist.includes(decoded.uid)
    || (typeof decoded.email === 'string' && allowlist.includes(decoded.email));
  if (!isAdmin || !uidOrEmailAllowed) throw new Error('Forbidden');
  return decoded;
}

export { cookieName };
