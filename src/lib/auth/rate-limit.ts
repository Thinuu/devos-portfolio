/**
 * In-memory rate limiting for admin authentication attempts.
 * Tracks failed attempts by IP and email within a 10-minute sliding window.
 * After 5 failed attempts, requests are blocked for the remaining duration of the window.
 */

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

// Global maps so state persists across hot-reloads in Node runtime
const globalRateLimit = globalThis as unknown as {
  __authIpAttempts?: Map<string, number[]>;
  __authEmailAttempts?: Map<string, number[]>;
  __forgotPasswordAttempts?: Map<string, number[]>;
};

if (!globalRateLimit.__authIpAttempts) {
  globalRateLimit.__authIpAttempts = new Map<string, number[]>();
}
if (!globalRateLimit.__authEmailAttempts) {
  globalRateLimit.__authEmailAttempts = new Map<string, number[]>();
}
if (!globalRateLimit.__forgotPasswordAttempts) {
  globalRateLimit.__forgotPasswordAttempts = new Map<string, number[]>();
}

const ipAttempts = globalRateLimit.__authIpAttempts;
const emailAttempts = globalRateLimit.__authEmailAttempts;
const forgotPasswordAttempts = globalRateLimit.__forgotPasswordAttempts;

function cleanOldTimestamps(timestamps: number[], now: number): number[] {
  return timestamps.filter((t) => now - t < WINDOW_MS);
}

export interface RateLimitStatus {
  blocked: boolean;
  retryAfterMinutes: number;
  attemptsRemaining: number;
  errorMessage?: string;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim();
    if (firstIp) return firstIp;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

export function checkLoginRateLimit(ip: string, email?: string | null): RateLimitStatus {
  const now = Date.now();
  const normalizedEmail = email ? email.trim().toLowerCase() : null;

  const validIpAttempts = cleanOldTimestamps(ipAttempts.get(ip) || [], now);
  ipAttempts.set(ip, validIpAttempts);

  let validEmailAttempts: number[] = [];
  if (normalizedEmail) {
    validEmailAttempts = cleanOldTimestamps(emailAttempts.get(normalizedEmail) || [], now);
    emailAttempts.set(normalizedEmail, validEmailAttempts);
  }

  const isIpBlocked = validIpAttempts.length >= MAX_ATTEMPTS;
  const isEmailBlocked = normalizedEmail ? validEmailAttempts.length >= MAX_ATTEMPTS : false;

  if (isIpBlocked || isEmailBlocked) {
    // Determine the oldest attempt among the triggering group
    const triggeringList = isIpBlocked && isEmailBlocked
      ? (validIpAttempts[0] < validEmailAttempts[0] ? validIpAttempts : validEmailAttempts)
      : isIpBlocked
        ? validIpAttempts
        : validEmailAttempts;

    const oldest = triggeringList[0] || now;
    const timeRemainingMs = Math.max(0, oldest + WINDOW_MS - now);
    const minutes = Math.max(1, Math.ceil(timeRemainingMs / 60000));

    return {
      blocked: true,
      retryAfterMinutes: minutes,
      attemptsRemaining: 0,
      errorMessage: `Too many attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
    };
  }

  const maxAttemptsUsed = Math.max(
    validIpAttempts.length,
    normalizedEmail ? validEmailAttempts.length : 0
  );

  return {
    blocked: false,
    retryAfterMinutes: 0,
    attemptsRemaining: Math.max(0, MAX_ATTEMPTS - maxAttemptsUsed),
  };
}

export function recordFailedLogin(ip: string, email?: string | null): RateLimitStatus {
  const now = Date.now();
  const normalizedEmail = email ? email.trim().toLowerCase() : null;

  const validIpAttempts = cleanOldTimestamps(ipAttempts.get(ip) || [], now);
  validIpAttempts.push(now);
  ipAttempts.set(ip, validIpAttempts);

  if (normalizedEmail) {
    const validEmailAttempts = cleanOldTimestamps(emailAttempts.get(normalizedEmail) || [], now);
    validEmailAttempts.push(now);
    emailAttempts.set(normalizedEmail, validEmailAttempts);
  }

  return checkLoginRateLimit(ip, normalizedEmail);
}

export function clearLoginRateLimit(ip: string, email?: string | null): void {
  ipAttempts.delete(ip);
  if (email) {
    emailAttempts.delete(email.trim().toLowerCase());
  }
}

export function checkForgotPasswordRateLimit(ip: string, email?: string | null): RateLimitStatus {
  const now = Date.now();
  const normalizedKey = `${ip}:${(email || '').trim().toLowerCase()}`;
  const attempts = cleanOldTimestamps(forgotPasswordAttempts.get(normalizedKey) || [], now);
  forgotPasswordAttempts.set(normalizedKey, attempts);

  if (attempts.length >= MAX_ATTEMPTS) {
    const oldest = attempts[0] || now;
    const timeRemainingMs = Math.max(0, oldest + WINDOW_MS - now);
    const minutes = Math.max(1, Math.ceil(timeRemainingMs / 60000));
    return {
      blocked: true,
      retryAfterMinutes: minutes,
      attemptsRemaining: 0,
      errorMessage: `Too many attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
    };
  }

  return {
    blocked: false,
    retryAfterMinutes: 0,
    attemptsRemaining: Math.max(0, MAX_ATTEMPTS - attempts.length),
  };
}

export function recordForgotPasswordAttempt(ip: string, email?: string | null): RateLimitStatus {
  const now = Date.now();
  const normalizedKey = `${ip}:${(email || '').trim().toLowerCase()}`;
  const attempts = cleanOldTimestamps(forgotPasswordAttempts.get(normalizedKey) || [], now);
  attempts.push(now);
  forgotPasswordAttempts.set(normalizedKey, attempts);

  return checkForgotPasswordRateLimit(ip, email);
}

/**
 * Resets all rate limit records. Exported for test suites.
 */
export function resetRateLimits(): void {
  ipAttempts.clear();
  emailAttempts.clear();
  forgotPasswordAttempts.clear();
}
