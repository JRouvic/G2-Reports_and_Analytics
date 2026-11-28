import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHero from '../components/AuthHero';
import '../styles/base.css';
import '../styles/auth.css';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // step 1 = enter email, step 2 = enter OTP
  const [step,    setStep]    = useState(1);
  const [email,   setEmail]   = useState('');
  const [code,    setCode]    = useState('');
  const [error,   setError]   = useState('');
  const [note,    setNote]    = useState('');
  const [loading, setLoading] = useState(false);

  async function post(url, body) {
    const res  = await fetch(url, {
      method:  'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });
    const data = await res.json();
    return { ok: res.ok, data };
  }

  async function handleSend(e) {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    if (!em) { setError('This field is required.'); return; }

    setLoading(true); setError(''); setNote('');
    try {
      // first check the email exists in our DB via backend
      const chk = await fetch('/api-backend/users', { credentials: 'include' });
      const chkData = await chk.json();
      const users = chkData.users || [];
      const exists = users.some(u => u.email.toLowerCase() === em);
      if (!exists) {
        setError('No account found with this email.');
        setLoading(false); return;
      }

      const { ok, data } = await post('/api/send-otp', { email: em });
      if (!ok) { setError(data.error || 'Failed to send code.'); setLoading(false); return; }

      setNote('A 6-digit code was sent to your email.');
      setStep(2);
    } catch {
      setError('Cannot reach the server.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError(''); setNote('');
    setLoading(true);
    try {
      const { ok, data } = await post('/api/send-otp', { email: email.trim().toLowerCase() });
      setCode('');
      if (!ok) { setError(data.error || 'Failed to resend code.'); }
      else      { setNote('A new code was sent to your email.'); }
    } catch {
      setError('Cannot reach the server.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!/^\d{6}$/.test(trimmed)) { setError('Enter the 6-digit code.'); return; }

    setLoading(true); setError('');
    try {
      const { ok, data } = await post('/api/verify-otp', {
        email: email.trim().toLowerCase(),
        code:  trimmed,
      });
      if (!ok) { setError(data.error || 'Verification failed.'); setLoading(false); return; }

      // OTP verified — pass email to reset page
      sessionStorage.setItem('3a_reset_email', email.trim().toLowerCase());
      navigate('/reset-password', { replace: true });
    } catch {
      setError('Cannot reach the server.');
      setLoading(false);
    }
  }

  return (
    <div className="split">
      <AuthHero
        title={step === 1 ? 'Forgot your password?' : 'Check your email.'}
        subtitle={
          step === 1
            ? 'Enter the email linked to your account and we will send you a verification code.'
            : 'Enter the 6-digit code we sent to verify it\'s you.'
        }
      />

      <main className="form-side">
        {step === 1 ? (
          <form className="card auth-card" onSubmit={handleSend} noValidate>
            <div>
              <h2>Forgot password</h2>
              <p className="muted">We will send a code to your email.</p>
            </div>

            {error && <div className="alert">{error}</div>}

            <div>
              <label className="field">Email
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  className={error ? 'bad' : ''}
                  autoComplete="email"
                  autoFocus
                />
              </label>
            </div>

            <button type="submit" className="button" disabled={loading}>
              {loading ? 'Sending code…' : 'Send verification code'}
            </button>

            <p className="center muted">
              Remembered it?&nbsp;
              <a href="/login" onClick={e => { e.preventDefault(); navigate('/login'); }}>
                Back to log in
              </a>
            </p>
          </form>
        ) : (
          <form className="card auth-card" onSubmit={handleVerify} noValidate>
            <div>
              <h2>Enter the code</h2>
              <p className="muted">
                Sent to <b>{email}</b>. It expires in 10 minutes.
              </p>
            </div>

            {note  && <div className="success">{note}</div>}
            {error && <div className="alert">{error}</div>}

            <div>
              <label className="field">6-digit code
                <input
                  type="text"
                  className={`otp-input${error ? ' bad' : ''}`}
                  placeholder="000000"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={e => { setCode(e.target.value); setError(''); }}
                  autoComplete="one-time-code"
                  autoFocus
                />
              </label>
              {error && <p className="er">{error}</p>}
            </div>

            <button type="submit" className="button" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify code'}
            </button>

            <div className="row" style={{ justifyContent: 'center', gap: '12px' }}>
              <button type="button" className="button secondary small"
                onClick={handleResend} disabled={loading}>
                Resend code
              </button>
              <span className="muted">·</span>
              <button type="button" className="button secondary small"
                onClick={() => { setStep(1); setCode(''); setError(''); setNote(''); }}>
                Change email
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
