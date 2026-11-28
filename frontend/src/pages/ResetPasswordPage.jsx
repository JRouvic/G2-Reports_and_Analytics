import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { flash } from '../store/db';
import AuthHero from '../components/AuthHero';
import '../styles/base.css';
import '../styles/auth.css';

const EyeIcon = ({ open }) =>
  open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [email] = useState(() => sessionStorage.getItem('3a_reset_email') || '');

  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [showCf,    setShowCf]    = useState(false);
  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    if (!email) navigate('/forgot-password', { replace: true });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const x = {};
    if (!password)              x.pw = 'This field is required.';
    else if (password.length < 6) x.pw = 'Password must be at least 6 characters.';
    if (!confirm)               x.cf = 'This field is required.';
    else if (confirm !== password) x.cf = 'Passwords do not match.';
    if (Object.keys(x).length) { setErrors(x); return; }

    setLoading(true); setErrors({});
    try {
      const res  = await fetch('/api-backend/users/reset-password', {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setErrors({ global: data.error || 'Failed to reset password.' }); setLoading(false); return; }

      sessionStorage.removeItem('3a_reset_email');
      sessionStorage.setItem('3a_prefill', email);
      flash('Password updated successfully. Please log in with your new password.');
      navigate('/login', { replace: true });
    } catch {
      setErrors({ global: 'Cannot reach the server.' });
      setLoading(false);
    }
  }

  if (!email) return null;

  return (
    <div className="split">
      <AuthHero
        title="Set a new password."
        subtitle="Choose a strong password you haven't used before."
      />

      <main className="form-side">
        <form className="card auth-card" onSubmit={handleSubmit} noValidate>
          <div>
            <h2>New password</h2>
            <p className="muted">Setting a new password for <b>{email}</b>.</p>
          </div>

          {errors.global && <div className="alert">{errors.global}</div>}

          <div>
            <label className="field">New password
              <div className="pw-wrap">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(x => ({ ...x, pw: '' })); }}
                  className={errors.pw ? 'bad' : ''}
                  autoComplete="new-password"
                  autoFocus
                />
                <button type="button" className="pw-eye"
                  onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}>
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </label>
            {errors.pw && <p className="er">{errors.pw}</p>}
          </div>

          <div>
            <label className="field">Confirm password
              <div className="pw-wrap">
                <input
                  type={showCf ? 'text' : 'password'}
                  placeholder="Re-enter your new password"
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setErrors(x => ({ ...x, cf: '' })); }}
                  className={errors.cf ? 'bad' : ''}
                  autoComplete="new-password"
                />
                <button type="button" className="pw-eye"
                  onClick={() => setShowCf(v => !v)}
                  aria-label={showCf ? 'Hide password' : 'Show password'}>
                  <EyeIcon open={showCf} />
                </button>
              </div>
            </label>
            {errors.cf && <p className="er">{errors.cf}</p>}
          </div>

          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Saving…' : 'Save new password'}
          </button>
        </form>
      </main>
    </div>
  );
}
