import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import {
  checkForgotPasswordRateLimit,
  recordForgotPasswordAttempt,
  getClientIp,
} from '@/lib/auth/rate-limit';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    let body: { email?: string } = {};
    try {
      body = await request.json();
    } catch {
      // invalid JSON
    }

    const email = typeof body.email === 'string' ? body.email.trim() : '';

    // Check rate limit first
    const rateStatus = checkForgotPasswordRateLimit(ip, email);
    if (rateStatus.blocked) {
      return NextResponse.json(
        { error: rateStatus.errorMessage, blocked: true },
        { status: 429 }
      );
    }

    // Record the attempt
    recordForgotPasswordAttempt(ip, email);

    // If valid email string, trigger Firebase Admin password reset check
    if (email && email.includes('@')) {
      try {
        const auth = getAuth(getFirebaseAdmin().app);
        // Will generate link if user exists; throws auth/user-not-found if not
        await auth.generatePasswordResetLink(email);
      } catch {
        // Do not leak whether the user exists
      }
    }

    // Always return the exact neutral message
    return NextResponse.json({
      ok: true,
      message: 'If an account exists, a reset email has been sent.',
    });
  } catch {
    // Even on server failure, return safe neutral message unless rate-limited
    return NextResponse.json({
      ok: true,
      message: 'If an account exists, a reset email has been sent.',
    });
  }
}
