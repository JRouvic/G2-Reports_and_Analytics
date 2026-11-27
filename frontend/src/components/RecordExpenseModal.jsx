import ModalShell from './ModalShell';

const RecordExpenseModal = ({ form, setForm, formErrs, onClose, onSave }) => (
  <ModalShell title="Record an expense" onClose={onClose}>
    <p className="muted small">Equipment use, transportation, others.</p>
    <div style={{ marginTop: 14 }}>
      <label className="field">Description
        <input type="text" placeholder="e.g. Gas, packaging" value={form.d}
          onChange={e => setForm(x => ({ ...x, d: e.target.value }))} className={formErrs.xd ? 'bad' : ''} />
      </label>
      {formErrs.xd && <p className="er">{formErrs.xd}</p>}
    </div>
    <div style={{ marginTop: 14 }}>
      <label className="field">Amount (₱)
        <input type="number" placeholder="0" min="0" step="any" value={form.a}
          onChange={e => setForm(x => ({ ...x, a: e.target.value }))} className={formErrs.xa ? 'bad' : ''} />
      </label>
      {formErrs.xa && <p className="er">{formErrs.xa}</p>}
    </div>
    <div style={{ marginTop: 14 }}>
      <label className="field">Date
        <input type="date" value={form.t}
          onChange={e => setForm(x => ({ ...x, t: e.target.value }))} className={formErrs.xt ? 'bad' : ''} />
      </label>
      {formErrs.xt && <p className="er">{formErrs.xt}</p>}
    </div>
    <div className="form-actions">
      <button className="button secondary" onClick={onClose}>Cancel</button>
      <button className="button" onClick={onSave}>Add Expense</button>
    </div>
  </ModalShell>
);

export default RecordExpenseModal;