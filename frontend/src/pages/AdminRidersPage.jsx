import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import AdminPageHeader from '../components/AdminPageHeader';
import Alert from '../components/Alert';
import SuccessNote from '../components/SuccessNote';
import RiderTable from '../components/RiderTable';
import RiderModal from '../components/RiderModal';
import ConfirmModal from '../components/ConfirmModal';
import { api } from '../store/api';
import { M } from '../store/db';

const EMPTY = { id: null, first_name: '', last_name: '', email: '', mobile: '', password: '' };

export default function AdminRidersPage() {
  const [riders,  setRiders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [modal,   setModal]   = useState(false);
  const [resId,   setResId]   = useState(null);
  const [resName, setResName] = useState('');
  const [form,    setForm]    = useState(EMPTY);
  const [errors,  setErrors]  = useState({});
  const [note,    setNote]    = useState('');

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/riders');
      setRiders(res.riders || []);
    } catch (e) {
      setError(e.message || 'Failed to load riders.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openAdd() {
    setForm(EMPTY); setErrors({}); setNote(''); setModal(true);
  }

  function openEdit(r) {
    setForm({ id: r.id, first_name: r.first_name || '', last_name: r.last_name || '', email: r.email, mobile: r.mobile, password: '' });
    setErrors({}); setNote(''); setModal(true);
  }

  async function handleSave() {
    const em = form.email.trim().toLowerCase();
    const x  = {};
    const isEdit = !!form.id;

    if (!form.first_name.trim())             x.rfn = 'This field is required.';
    if (!form.last_name.trim())              x.rln = 'This field is required.';
    if (!/^\S+@\S+\.\S+$/.test(em))         x.re  = 'Enter a valid email.';
    if (!form.mobile.trim())                 x.rm  = 'This field is required.';
    if (!isEdit && form.password.length < 6) x.rp  = 'Set a password of at least 6 characters.';

    if (Object.keys(x).length) { setErrors(x); return; }

    const body = {
      first_name: form.first_name.trim(),
      last_name:  form.last_name.trim(),
      email: em,
      mobile: form.mobile.trim()
    };
    if (form.password) body.password = form.password;

    try {
      if (isEdit) {
        await api.put(`/riders/${form.id}`, body);
      } else {
        await api.post('/riders', body);
      }
      setModal(false);
      setNote(`${form.first_name} ${form.last_name} saved.`);
      await loadData();
    } catch (e) {
      setErrors({ re: e.message || 'Failed to save rider.' });
    }
  }

  async function handleResign() {
    try {
      await api.patch(`/riders/${resId}/resign`);
      setNote(`${resName} is now marked as resigned.`);
      setResId(null); setResName('');
      await loadData();
    } catch (e) {
      setError(e.message || 'Failed to resign rider.');
      setResId(null); setResName('');
    }
  }

  async function reactivate(id, name) {
    try {
      await api.patch(`/riders/${id}/reactivate`);
      setNote(`${name} is active again.`);
      await loadData();
    } catch (e) {
      setError(e.message || 'Failed to reactivate rider.');
    }
  }

  function tryResign(r) {
    if (r.currentOrder) {
      setErrors({ g: `${r.name} still has an order out for delivery.` });
      return;
    }
    setErrors({}); setResId(r.id); setResName(r.name);
  }

  return (
    <AdminLayout>
      <AdminPageHeader title="Riders" subtitle="Add new riders, update details, or mark a rider as resigned.">
        <button className="button" onClick={openAdd}>Add Rider</button>
      </AdminPageHeader>

      <SuccessNote text={note} />
      {errors.g && <Alert text={errors.g} />}
      <Alert text={error} />

      <RiderTable
        riders={riders}
        loading={loading}
        M={M}
        onEdit={openEdit}
        onResign={tryResign}
        onReactivate={(id, name) => reactivate(id, name)}
      />

      {modal && (
        <RiderModal
          form={form}
          setForm={setForm}
          errors={errors}
          onClose={() => setModal(false)}
          onSave={handleSave}
        />
      )}

      {resId !== null && (
        <ConfirmModal
          title={`Mark ${resName} as resigned?`}
          message="They can no longer log in or be assigned orders. Past records are kept."
          confirmLabel="Yes, Mark as Resigned"
          danger
          onClose={() => { setResId(null); setResName(''); }}
          onConfirm={handleResign}
        />
      )}
    </AdminLayout>
  );
}