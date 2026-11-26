import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, logout } from '../store/api';
import { M } from '../store/db';
import RiderLayout from '../components/RiderLayout';
import PageIntro from '../components/PageIntro';
import Alert from '../components/Alert';
import SuccessNote from '../components/SuccessNote';
import RiderStats from '../components/RiderStats';
import RiderList from '../components/RiderList';
import '../styles/base.css';
import '../styles/menu.css';
import '../styles/rider.css';

function readImage(file, max = 800) {
  return new Promise((ok, no) => {
    if (!file || !/^image\//.test(file.type)) return no('Please choose an image file.');
    const r = new FileReader();
    r.onerror = () => no('That file could not be read.');
    r.onload  = () => {
      const im = new Image();
      im.onerror = () => no('That file could not be read as an image.');
      im.onload  = () => {
        const k = Math.min(1, max / Math.max(im.width, im.height));
        const c = document.createElement('canvas');
        c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        ok(c.toDataURL('image/jpeg', 0.85));
      };
      im.src = r.result;
    };
    r.readAsDataURL(file);
  });
}

export default function RiderPage() {
  const navigate = useNavigate();
  const name = localStorage.getItem('3a_kitchen_name') || '';
  const role = localStorage.getItem('3a_kitchen_role') || '';

  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [open,    setOpen]    = useState({});
  const [amounts, setAmounts] = useState({});
  const [checks,  setChecks  ] = useState({});
  const [errs,    setErrs]   = useState({});
  const [flash,   setFlash]  = useState('');

  useEffect(() => {
    if (!role || role !== 'r') { navigate('/login', { replace: true }); return; }
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/orders/mine');
      setOrders(Array.isArray(res) ? res : (res.orders || []));
    } catch(e) {
      setError(e.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }

  const myOrders  = orders;
  const delivered = myOrders.filter(o => o.status === 'Delivered');
  const pending   = myOrders.filter(o => o.status !== 'Delivered');

  async function confirmCash(id) {
    const o   = myOrders.find(x => x.id === id);
    const amt = Number(amounts[id] || 0);
    const e   = {};
    if (amt !== Number(o.total)) e[id] = `Amount must match the order total of ${M(o.total)}.`;
    else if (!checks[id])        e[id] = 'Please tick the confirmation box.';
    if (Object.keys(e).length) { setErrs(e); return; }

    try {
      await api.patch(`/orders/${id}/cash`);
      setErrs({});
      await loadData();
    } catch (err) {
      setErrs({ [id]: err.message || 'Failed to confirm cash.' });
    }
  }

  async function uploadProof(id, file) {
    if (!file) return;
    try {
      const img = await readImage(file);
      await api.patch(`/orders/${id}/proof`, { proof_image: img });
      await loadData();
    } catch (msg) {
      alert(typeof msg === 'string' ? msg : (msg.message || 'Failed to upload proof.'));
    }
  }

  async function markDelivered(id) {
    try {
      await api.patch(`/orders/${id}/deliver`);
      setFlash(`Order #${id} marked as delivered.`);
      setTimeout(() => setFlash(''), 3000);
      await loadData();
    } catch (e) {
      setError(e.message || 'Failed to mark order as delivered.');
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  if (role !== 'r') return null;

  const cashTodo = pending.reduce((t, o) => t + Number(o.total), 0);
  const cashGot  = delivered.reduce((t, o) => t + Number(o.total), 0);

  return (
    <RiderLayout name={name} onLogout={handleLogout}>
      <PageIntro title="My Deliveries" subtitle="Collect cash, upload proof, then mark each order delivered." />

      <SuccessNote text={flash} />
      <Alert text={error} />

      <RiderStats
        cashTodo={cashTodo}
        cashGot={cashGot}
        completed={delivered.length}
        total={myOrders.length}
      />

      <RiderList
        orders={myOrders}
        loading={loading}
        open={open}
        onToggle={id => setOpen(o => ({ ...o, [id]: !o[id] }))}
        amounts={amounts}
        onAmountChange={(id, val) => setAmounts(a => ({ ...a, [id]: val }))}
        checks={checks}
        onCheckChange={(id, checked) => setChecks(c => ({ ...c, [id]: checked }))}
        errs={errs}
        onConfirmCash={confirmCash}
        onUploadProof={uploadProof}
        onMarkDelivered={markDelivered}
      />
    </RiderLayout>
  );
}