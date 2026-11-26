import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import AdminPageHeader from '../components/AdminPageHeader';
import Alert from '../components/Alert';
import PromoTable from '../components/PromoTable';
import PromoModal from '../components/PromoModal';
import ConfirmModal from '../components/ConfirmModal';
import { api } from '../store/api';
import { M, today, fd } from '../store/db';

const EMPTY = { code: '', type: '%', value: '', min: '', limit: '', once: true, expires: '' };

export default function AdminPromosPage() {
  const [promos,  setPromos]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [modal,   setModal]   = useState(false);
  const [delCode, setDelCode] = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [errors,  setErrors]  = useState({});

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/promos');
      setPromos(res.promos || []);
    } catch (e) {
      setError(e.message || 'Failed to load promos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function statusLabel(p) {
    if (p.expires_on <= today)                              return 'Expired';
    if (p.usage_limit && p.used_count >= p.usage_limit)    return 'Fully used';
    if (!p.enabled)                                        return 'Disabled';
    return 'Active';
  }

  function statusClass(p) {
    const l = statusLabel(p);
    return { Active: 'p-Active', Expired: 'p-Expired', 'Fully used': 'p-Fully', Disabled: 'p-Disabled' }[l];
  }

  function isDone(p) {
    return p.expires_on <= today || (p.usage_limit && p.used_count >= p.usage_limit);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const x   = {};
    const c   = form.code.trim().toUpperCase();
    const v   = Number(form.value);
    const lim = form.limit;

    if (!c) x.cc = 'Enter or generate a code.';
    else if (promos.some(p => p.code === c)) x.cc = 'This code already exists.';
    if (!(v > 0)) x.cv = 'Enter a value greater than 0.';
    else if (form.type === '%' && v > 100) x.cv = 'Percent cannot be more than 100.';
    else if (v > 9999) x.cv = 'Value must not exceed 4 digits (9,999).';
    if (lim && !(Number(lim) >= 1)) x.cl = 'Usage limit must be at least 1, or leave empty for no limit.';
    else if (lim && Number(lim) > 9999) x.cl = 'Usage limit must not exceed 4 digits (9,999).';
    if (!form.expires) x.cx = 'Choose an expiry date.';
    else if (form.expires <= today) x.cx = 'Expiry date must be after today.';

    if (Object.keys(x).length) { setErrors(x); return; }

    try {
      await api.post('/promos', {
        code:          c,
        type:          form.type,
        value:         v,
        min_order:     Number(form.min) || 0,
        expires_on:    form.expires,
        usage_limit:   lim ? +lim : null,
       once_per_user: form.once,
      });
      setModal(false); setForm(EMPTY); setErrors({});
      await loadData();
    } catch (e) {
      setErrors({ cc: e.message || 'Failed to create promo.' });
    }
  }

  async function toggle(code) {
    const p = promos.find(x => x.code === code);
    if (!p || isDone(p)) return;
    try {
      await api.patch(`/promos/${code}`, { enabled: !p.enabled });
     await loadData();
    } catch (e) {
      setError(e.message || 'Failed to toggle promo.');
    }
  }

  async function confirmDelete() {
    try {
      await api.delete(`/promos/${delCode}`);
      setDelCode(null);
      await loadData();
    } catch (e) {
      setError(e.message || 'Failed to delete promo.');
      setDelCode(null);
    }
  }

  return (
    <AdminLayout>
      <AdminPageHeader title="Promo Generator" subtitle="Create discount codes customers enter at checkout.">
        <button className="button" onClick={() => { setForm(EMPTY); setErrors({}); setModal(true); }}>New Code</button>
      </AdminPageHeader>

      <Alert text={error} />

      <PromoTable
        promos={promos}
        loading={loading}
        onToggle={toggle}
        onDelete={code => setDelCode(code)}
        statusLabel={statusLabel}
        statusClass={statusClass}
        isDone={isDone}
        M={M}
        fd={fd}
      />

      {modal && (
        <PromoModal
          form={form}
          setForm={setForm}
          errors={errors}
          onSubmit={handleSubmit}
          onClose={() => setModal(false)}
        />
      )}

      {delCode && (
        <ConfirmModal
          title={`Delete "${delCode}"?`}
          message="The code is removed and customers can no longer use it. Past orders keep their discount amounts."
          confirmLabel="Yes, Delete"
          danger
          onClose={() => setDelCode(null)}
          onConfirm={confirmDelete}
        />
      )}
    </AdminLayout>
  );
}
