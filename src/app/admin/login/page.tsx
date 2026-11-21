'use client';

import { FormEvent, useState } from 'react';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirebaseClient } from '@/lib/firebase/client';
import TULogo from '@/components/brand/TULogo';
import { ArrowUpRight, Eye, EyeOff, KeyRound, LockKeyhole } from 'lucide-react';
import { readJsonResponse } from '@/lib/http/json';

export default function AdminLogin() {
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    const form = new FormData(event.currentTarget);
    try {
      const { auth } = getFirebaseClient();
      const credential = await signInWithEmailAndPassword(auth, String(form.get('email')), String(form.get('password')));
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: await credential.user.getIdToken() }),
      });
      if (!response.ok) {
        const payload = await readJsonResponse<{ error?: string }>(response);
        throw new Error(payload?.error || 'Unable to create an administrator session.');
      }
      window.location.assign('/admin');
    } catch (loginError) {
      const code = loginError && typeof loginError === 'object' && 'code' in loginError
        ? String(loginError.code)
        : '';
      setError(code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password'
        ? 'The email or password is incorrect.'
        : code === 'auth/too-many-requests'
          ? 'Too many attempts. Wait a few minutes and try again.'
          : loginError instanceof Error ? loginError.message : 'Unable to sign in.');
      setBusy(false);
    }
  }

  async function resetPassword() {
    const email = window.prompt('Enter your administrator email address');
    if (!email) return;
    setError('');
    setNotice('');
    try {
      await sendPasswordResetEmail(getFirebaseClient().auth, email);
      setNotice('If that account exists, a password reset email has been sent.');
    } catch {
      setError('Unable to send a password reset email. Check the email and Firebase configuration.');
    }
  }

  return (
    <main className="admin-login">
      <div className="admin-login-layout">
        <section className="admin-login-intro">
          <div className="admin-login-brand"><TULogo variant="main" /></div>
          <p className="admin-eyebrow"><span className="admin-login-status-dot" /> THINU.ME / ADMIN CONSOLE</p>
          <h1>Manage your portfolio with confidence.</h1>
          <p>Update content, design, career documents, and publishing settings from one secure workspace.</p>
          <div className="admin-login-trust"><LockKeyhole size={16} /> Protected by Firebase Authentication</div>
          <a className="admin-login-back" href="/">Return to portfolio <ArrowUpRight size={15} /></a>
        </section>
        <form className="admin-login-card" onSubmit={submit}>
          <div>
            <p className="admin-eyebrow">Administrator access</p>
            <h2>Sign in</h2>
          </div>
          <label>Email<input name="email" type="email" required autoComplete="email" placeholder="admin@example.com" /></label>
          <label>Password
            <span className="admin-password-field">
              <input name="password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" placeholder="Enter your password" />
              <button type="button" className="admin-password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </label>
        {error && <p className="admin-error" role="alert">{error}</p>}
          {notice && <p className="admin-notice" role="status">{notice}</p>}
          <button className="admin-button primary admin-login-submit" disabled={busy}><KeyRound size={16} />{busy ? 'Signing in…' : 'Sign in securely'}</button>
          <button type="button" className="admin-forgot" onClick={resetPassword}>Forgot password?</button>
          <p className="admin-login-help">Administrator accounts are created manually in Firebase. Public registration is disabled.</p>
        </form>
      </div>
    </main>
  );
}
