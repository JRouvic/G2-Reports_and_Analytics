import ModalShell from './ModalShell';

const RiderModal = ({ form, setForm, errors, onClose, onSave }) => {
  const f = k => e => setForm(x => ({ ...x, [k]: e.target.value }));

  const fields = [
    { label: 'First name',               key: 'first_name', type: 'text',     ph: 'e.g. Mark',         err: errors.rfn },
    { label: 'Last name',                key: 'last_name',  type: 'text',     ph: 'e.g. Reyes',        err: errors.rln },
    { label: 'Email (rider login)',      key: 'email',      type: 'email',    ph: 'rider@example.com', err: errors.re  },
    { label: 'Mobile number',            key: 'mobile',     type: 'text',     ph: '09XX XXX XXXX',     err: errors.rm  },
    { label: form.id ? 'New password (leave blank to keep)' : 'Password', key: 'password', type: 'password', ph: 'At least 6 characters', err: errors.rp },
  ];

  return (
    <ModalShell title={form.id ? 'Edit Rider' : 'Add Rider'} onClose={onClose}>
      {fields.map(({ label, key, type, ph, err }) => (
        <div key={key} style={{ marginTop: 14 }}>
          <label className="field">{label}
            <input type={type} placeholder={ph} value={form[key]} onChange={f(key)}
              className={err ? 'bad' : ''} />
          </label>
          {err && <p className="er">{err}</p>}
        </div>
      ))}
      <div className="form-actions">
        <button className="button secondary" onClick={onClose}>Cancel</button>
        <button className="button" onClick={onSave}>Save Rider</button>
      </div>
    </ModalShell>
  );
};

export default RiderModal;