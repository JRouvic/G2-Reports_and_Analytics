import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import AdminPageHeader from '../components/AdminPageHeader';
import Alert from '../components/Alert';
import OrderTable from '../components/OrderTable';
import RejectOrderModal from '../components/RejectOrderModal';
import { api } from '../store/api';
import '../styles/tracker.css';

export default function AdminOrdersPage() {
  const [orders,   setOrders]   = useState([]);
  const [freeList, setFreeList] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [filter,   setFilter]   = useState('all');
  const [open,     setOpen]     = useState({});
  const [decId,    setDecId]    = useState(null);
  const [reason,   setReason]   = useState('');
  const [decErr,   setDecErr]   = useState('');
  const [riderSel, setRiderSel] = useState({});

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const ordRes = await api.get('/orders');
      setOrders(ordRes.orders || []);
    } catch (e) {
      setError(e.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const toggle = id => setOpen(o => ({ ...o, [id]: !o[id] }));

  const displayed = orders
    .filter(o => {
      if (filter === 'rush') return !!o.is_rush;
      return filter === 'all' || o.status === filter;
    })
    .sort((a, b) => (b.is_rush || 0) - (a.is_rush || 0)); // rush orders float to top

  async function accept(id) {
    try {
      await api.patch(`/orders/${id}/accept`);
      await loadData();
    } catch (e) {
      setError(e.message || 'Failed to accept order.');
    }
  }

  function openReject(id) {
    setDecId(id); setReason(''); setDecErr('');
  }

  async function confirmReject() {
    if (!reason.trim()) { setDecErr('Please enter a reason before rejecting the order.'); return; }
    try {
      await api.patch(`/orders/${decId}/decline`, { reason: reason.trim() });
      setDecId(null); setReason(''); setDecErr('');
      await loadData();
    } catch (e) {
      setDecErr(e.message || 'Failed to decline order.');
    }
  }

  return (
    <AdminLayout>
      <AdminPageHeader title="Order Management" subtitle="Accept or reject each customer order." />
      <Alert text={error} />

      <OrderTable
        orders={displayed}
        loading={loading}
        filter={filter}
        onFilterChange={setFilter}
        freeList={freeList}
        riderSel={riderSel}
        onRiderSelect={(id, val) => setRiderSel(r => ({ ...r, [id]: val }))}
        onAccept={accept}
        openReject={openReject}
        open={open}
        onToggle={toggle}
      />

      {decId !== null && (
        <RejectOrderModal
          decId={decId}
          reason={reason}
          onReasonChange={e => { setReason(e.target.value); setDecErr(''); }}
          decErr={decErr}
          onClose={() => setDecId(null)}
          onConfirm={confirmReject}
        />
      )}
    </AdminLayout>
  );
}