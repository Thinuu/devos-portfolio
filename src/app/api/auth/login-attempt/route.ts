import { NextResponse } from 'next/server';
import {
  checkLoginRateLimit,
  recordFailedLogin,
  getClientIp,
  resetRateLimits,
} from '@/lib/auth/rate-limit';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    let body: { email?: string; action?: 'check' | 'record' | 'reset' } = {};
    try {
      body = await request.json();
    } catch {
      // empty body
    }

    const { email, action = 'record' } = body;

    if (action === 'reset' && process.env.NODE_ENV !== 'production') {
      resetRateLimits();
      return NextResponse.json({ ok: true, reset: true });
    }

    const status = action === 'check'
      ? checkLoginRateLimit(ip, email)
      : recordFailedLogin(ip, email);

    if (status.blocked) {
      return NextResponse.json(
        {
          error: status.errorMessage,
          blocked: true,
          retryAfterMinutes: status.retryAfterMinutes,
        },
        { status: 429 }
      );
    }

    return NextResponse.json({
      ok: true,
      blocked: false,
      attemptsRemaining: status.attemptsRemaining,
    });
  } catch {
    return NextResponse.json({ error: 'Rate limit service error' }, { status: 500 });
  }
}
