import { useState } from 'react';
import { Link } from 'react-router-dom';

const EyeIcon = ({ open }) =>
  open ? (
    /* eye-open */
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    /* eye-off */
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

const LoginForm = ({ email, setEmail, password, setPassword, errors, loading, note, onSubmit }) => {
  const [showPw, setShowPw] = useState(false);

  return (
    <main className="form-side">
      <form className="card auth-card" onSubmit={onSubmit} noValidate>
        <div>
          <h2>Log in</h2>
          <p className="muted">Enter your account details to continue.</p>
        </div>

        {note          && <div className="success">{note}</div>}
        {errors.global && <div className="alert">{errors.global}</div>}

        <div>
          <label className="field">Email
            <input type="email" placeholder="Enter your email address" value={email}
              onChange={e => setEmail(e.target.value)}
              className={errors.email ? 'bad' : ''} autoComplete="email" />
          </label>
          {errors.email && <p className="er">{errors.email}</p>}
        </div>

        <div>
          <label className="field">Password
            <div className="pw-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={errors.password ? 'bad' : ''}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="pw-eye"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showPw} />
              </button>
            </div>
          </label>
          {errors.password && <p className="er">{errors.password}</p>}
        </div>

        <button type="submit" className="button" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>

        <p className="center muted">
          No account yet?&nbsp;<Link to="/register">Register here</Link>
        </p>
      </form>
    </main>
  );
};

export default LoginForm;