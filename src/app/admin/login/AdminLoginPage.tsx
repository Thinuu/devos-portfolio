'use client';

import { Suspense, useState, FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { Lock, ArrowUpRight, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirebaseClient } from '@/lib/firebase/client';
import { readJsonResponse } from '@/lib/http/json';
import s from './login.module.css';

export function sanitizeAdminRedirect(target: string | null | undefined): string {
  if (!target) return '/admin';
  try {
    const trimmed = decodeURIComponent(target).trim();
    // Reject absolute URLs, protocol-relative URLs, and path traversal tricks
    if (
      trimmed.startsWith('/admin') &&
      !trimmed.startsWith('//') &&
      !trimmed.startsWith('/\\') &&
      !trimmed.includes('://') &&
      !trimmed.includes('\r') &&
      !trimmed.includes('\n')
    ) {
      return trimmed;
    }
  } catch {
    // fallback to safe default
  }
  return '/admin';
}

function SignInCard() {
  const searchParams = useSearchParams();
  const nextTarget = searchParams?.get('next') ?? '/admin';

  const [mode, setMode] = useState<'signin' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function handleSignIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');

    // Check offline status first
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setError('Network error. Please check your connection and try again.');
      setBusy(false);
      return;
    }

    try {
      const { auth } = getFirebaseClient();
      let idToken = '';

      try {
        const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
        idToken = await credential.user.getIdToken();
      } catch (authErr: unknown) {
        const code = authErr && typeof authErr === 'object' && 'code' in authErr
          ? String((authErr as { code: unknown }).code)
          : '';

        // Report failed attempt to server to record IP and email rate limit
        let serverRateLimitMsg = '';
        try {
          const attemptRes = await fetch('/api/auth/login-attempt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), action: 'record' }),
          });
          if (attemptRes.status === 429) {
            const data = await readJsonResponse<{ error?: string }>(attemptRes);
            serverRateLimitMsg = data?.error || 'Too many attempts. Try again in 10 minutes.';
          }
        } catch {
          // ignore tracking network errors
        }

        if (serverRateLimitMsg) {
          setError(serverRateLimitMsg);
        } else if (code === 'auth/too-many-requests') {
          setError('Too many attempts. Wait a few minutes and try again.');
        } else if (code === 'auth/user-disabled') {
          setError('This account has been disabled. Contact the administrator.');
        } else if (code === 'auth/network-request-failed') {
          setError('Network error. Please check your connection and try again.');
        } else if (
          code === 'auth/invalid-credential' ||
          code === 'auth/user-not-found' ||
          code === 'auth/wrong-password' ||
          code === 'auth/invalid-email'
        ) {
          setError('Email or password is incorrect');
        } else {
          setError('Unable to sign in. Please try again.');
        }

        setBusy(false);
        return;
      }

      // Exchange ID token for secure server session
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, remember }),
      });

      if (!response.ok) {
        // Sign out Firebase client if session rejected
        await signOut(auth).catch(() => {});

        if (response.status === 429) {
          const payload = await readJsonResponse<{ error?: string }>(response);
          setError(payload?.error || 'Too many attempts. Try again in 10 minutes.');
        } else {
          // Generic error for bad credentials or non-admin user
          setError('Email or password is incorrect');
        }
        setBusy(false);
        return;
      }

      // Success: safely redirect to intended admin path
      const safeRedirect = sanitizeAdminRedirect(nextTarget);
      window.location.assign(safeRedirect);
    } catch (err: unknown) {
      if (err instanceof TypeError && err.message.toLowerCase().includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Unable to sign in. Please try again.');
      }
      setBusy(false);
    }
  }

  async function handleForgotPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid administrator email address.');
      setBusy(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (response.status === 429) {
        const payload = await readJsonResponse<{ error?: string }>(response);
        setError(payload?.error || 'Too many attempts. Try again in 10 minutes.');
      } else {
        // Neutral message regardless of whether user exists
        setNotice('If an account exists, a reset email has been sent.');
      }
    } catch {
      // Even on failure, neutral message
      setNotice('If an account exists, a reset email has been sent.');
    } finally {
      setBusy(false);
    }
  }

  if (mode === 'forgot') {
    return (
      <form className={s.card} onSubmit={handleForgotPassword} aria-label="Reset password">
        <div className={s.cardHeader}>
          <p className={s.cardEyebrow}>Account Recovery</p>
          <h2 className={s.cardTitle}>Reset password</h2>
          <p className={s.cardDesc}>Enter your administrator email to receive a recovery link.</p>
        </div>

        <div className={s.fieldGroup}>
          <label htmlFor="admin-reset-email">Administrator Email</label>
          <input
            id="admin-reset-email"
            name="email"
            type="email"
            required
            autoComplete="username"
            inputMode="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
          />
        </div>

        <div aria-live="polite">
          {error && <p className={s.error} role="alert">{error}</p>}
          {notice && <p className={s.notice} role="status">{notice}</p>}
        </div>

        <button type="submit" className={s.submitBtn} disabled={busy}>
          {busy ? (
            <>
              <Loader2 className={s.spinner} size={16} />
              <span>Sending link…</span>
            </>
          ) : (
            'Send recovery link'
          )}
        </button>

        <button
          type="button"
          className={s.forgotBtn}
          onClick={() => {
            setMode('signin');
            setError('');
            setNotice('');
          }}
        >
          Return to sign in
        </button>
      </form>
    );
  }

  return (
    <form className={s.card} onSubmit={handleSignIn} aria-label="Administrator sign in">
      <div className={s.cardHeader}>
        <p className={s.cardEyebrow}>Administrator access</p>
        <h2 className={s.cardTitle}>Sign in</h2>
      </div>

      <div className={s.fieldGroup}>
        <label htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          name="email"
          type="email"
          required
          autoComplete="username"
          inputMode="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
        />
      </div>

      <div className={s.fieldGroup}>
        <label htmlFor="admin-password">Password</label>
        <div className={s.passwordWrapper}>
          <input
            id="admin-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
          <button
            type="button"
            className={s.passwordToggle}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <label className={s.rememberMe} htmlFor="admin-remember">
        <input
          type="checkbox"
          id="admin-remember"
          name="remember"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />
        <span>Remember this device (14 days)</span>
      </label>

      <div aria-live="polite">
        {error && <p className={s.error} role="alert">{error}</p>}
        {notice && <p className={s.notice} role="status">{notice}</p>}
      </div>

      <button type="submit" className={s.submitBtn} disabled={busy}>
        {busy ? (
          <>
            <Loader2 className={s.spinner} size={16} />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <KeyRound size={16} />
            <span>Sign in securely</span>
          </>
        )}
      </button>

      <button
        type="button"
        className={s.forgotBtn}
        onClick={() => {
          setMode('forgot');
          setError('');
          setNotice('');
        }}
      >
        Forgot password?
      </button>

      <p className={s.helpText}>
        Administrator accounts are created manually in Firebase. Public registration is disabled.
      </p>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <main className={s.page}>
      <div className={s.shell}>
        <section className={s.intro}>
          <div className={s.logo}>TU<span>.</span></div>
          <p className={s.eyebrow}>
            <span className={s.statusDot} />
            THINU.ME / ADMIN CONSOLE
          </p>
          <h1 className={s.title}>Manage your portfolio with confidence.</h1>
          <p className={s.lede}>
            Update content, design, career documents, and publishing settings from one secure workspace.
          </p>
          <div className={s.badge}>
            <Lock size={16} />
            Protected by Firebase Authentication
          </div>
          <a className={s.back} href="/">
            Return to portfolio <ArrowUpRight size={14} />
          </a>
        </section>
        <Suspense fallback={<div className={s.card} />}>
          <SignInCard />
        </Suspense>
      </div>
    </main>
  );
}
