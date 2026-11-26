import ModalShell from './ModalShell';
import { M, today, tmr, fd } from '../store/db';

const PromoModal = ({ form, setForm, errors, onSubmit, onClose }) => {
  const f = k => e => setForm(x => ({ ...x, [k]: e.target.value }));

  function preview() {
    const c  = form.code.trim().toUpperCase();
    const v  = Number(form.value), m = Number(form.min) || 0;
   const pc = form.type === '%';
    if (!c && !(v > 0) && !form.expires) return <span className="muted small">Fill in the form to preview.</span>;
    const warns = [];
    if (pc && v > 100) warns.push('Percent cannot be more than 100.');
    if (form.expires && form.expires <= today) warns.push('Expiry date is today or earlier — code would be expired.');
    return (
      <>
        <div className="small muted">What customers see</div>
        <div className="pv-code">{c || 'YOUR-CODE'}</div>
        <div className="small">
          {v > 0 ? (pc ? `${v}% off` : `${M(v)} off`) : '… off'}
          {m > 0 ? ` on orders of ${M(m)} or more` : ' on any order'}.
          {form.expires ? ` Expires on ${fd(form.expires)}.` : ''}
          {Number(form.limit) >= 1 ? ` Limited to the first ${form.limit} uses.` : ' No usage limit.'}
          {form.once ? ' One use per customer.' : ''}
        </div>
        {warns.map((w, i) => <p key={i} className="warn">{w}</p>)}
      </>
    );
  }

  return (
    <ModalShell title="Create discount code" onClose={onClose}>
      <form onSubmit={onSubmit} noValidate>

        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginTop: 14 }}>
          <div style={{ flex: 1 }}>
            <label className="field">Code
             <input type="text" placeholder="e.g. 3A-FIESTA10"
                value={form.code}
                onChange={e => setForm(x => ({ ...x, code: e.target.value.toUpperCase() }))}
                className={errors.cc ? 'bad' : ''} />
            </label>
          </div>
          <button type="button" className="button secondary"
            onClick={() => setForm(x => ({ ...x, code: '3A-' + Math.random().toString(36).slice(2, 6).toUpperCase() }))}>
            Generate
          </button>
        </div>
        {errors.cc && <p className="er">{errors.cc}</p>}

        <div className="form-row" style={{ marginTop: 14 }}>
          <div>
            <label className="field">Discount Type
              <select value={form.type} onChange={f('type')}>
                <option value="%">Percent off</option>
                <option value="₱">Fixed amount (₱)</option>
              </select>
            </label>
          </div>
          <div>
            <label className="field">Value
              <input type="number" min="0" max="9999" step="1"
                value={form.value} onChange={f('value')} className={errors.cv ? 'bad' : ''} />
            </label>
            {errors.cv && <p className="er">{errors.cv}</p>}
          </div>
        </div>

        <div className="form-row" style={{ marginTop: 14 }}>
          <div>
            <label className="field">Minimum Order (₱)
              <input type="number" min="0" max="9999" step="1" value={form.min} onChange={f('min')} />
            </label>
          </div>
          <div>
            <label className="field">Usage Limit (blank = no limit)
              <input type="number" min="1" max="9999" step="1"
                value={form.limit} onChange={f('limit')} className={errors.cl ? 'bad' : ''} />
            </label>
            {errors.cl && <p className="er">{errors.cl}</p>}
          </div>
        </div>

        <label className="check" style={{ marginTop: 14 }}>
          <input type="checkbox" checked={form.once}
            onChange={e => setForm(x => ({ ...x, once: e.target.checked }))} />
          Each customer can use this code only once
        </label>

        <div style={{ marginTop: 14 }}>
          <label className="field">Expiry Date
            <input type="date" min={tmr} value={form.expires} onChange={f('expires')}
              className={errors.cx ? 'bad' : ''} />
          </label>
          {errors.cx && <p className="er">{errors.cx}</p>}
        </div>
        <div className="pvbox">{preview()}</div>

        <div className="form-actions">
          <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="button">Save Code</button>
        </div>
      </form>
    </ModalShell>
  );
};

export default PromoModal;
