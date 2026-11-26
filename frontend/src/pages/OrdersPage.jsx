import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, logout } from '../store/api';
import { takeNote } from '../store/db';
import CustomerLayout from '../components/CustomerLayout';
import PageIntro from '../components/PageIntro';
import Alert from '../components/Alert';
import SuccessNote from '../components/SuccessNote';
import OrderFilter from '../components/OrderFilter';
import OrderList from '../components/OrderList';
import '../styles/base.css';
import '../styles/menu.css';
import '../styles/orders.css';
import '../styles/tracker.css';

export default function OrdersPage() {
  const navigate = useNavigate();
  const name  = localStorage.getItem('3a_kitchen_name') || '';
  const email = localStorage.getItem('3a_kitchen_user') || '';
  const role  = localStorage.getItem('3a_kitchen_role') || '';

  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [filter,  setFilter]  = useState('all');
  const [note]    = useState(() => takeNote());
  const [open,    setOpen]    = useState(() => {
    const just = sessionStorage.getItem('3a_open');
    if (just) { sessionStorage.removeItem('3a_open'); return { [just]: true }; }
    return {};
  });

  useEffect(() => {
    if (!email || role !== 'c') navigate('/login', { replace: true });
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get('/orders/mine')
      .then(data => setOrders(data.orders || []))
      .catch(err => setError(err.message || 'Failed to load orders.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  function orderAgain(order) {
    const cart = {};
    (order.items || []).forEach(({ item_id, quantity }) => {
      cart[item_id] = quantity;
    });
    sessionStorage.setItem('3a_cart', JSON.stringify(cart));
    navigate('/menu');
  }

  function goFeedback(orderId) {
    sessionStorage.setItem('3a_fbo', orderId);
    navigate('/feedback');
  }

  const myOrders = orders.filter(o => {
    if (filter === 'all')    return true;
    if (filter === 'Active') return ['Pending', 'Accepted', 'Out for delivery'].includes(o.status);
    return o.status === filter;
  });

  return (
    <CustomerLayout active="orders" name={name} onLogout={handleLogout}>
      <PageIntro title="My Orders" subtitle="Tap an order to see its status and details." />

      <SuccessNote text={note} />
      <Alert text={error} />

      <OrderFilter filter={filter} setFilter={setFilter} />

      <OrderList
        orders={myOrders}
        loading={loading}
        open={open}
        onToggle={id => setOpen(x => ({ ...x, [id]: !x[id] }))}
        onOrderAgain={orderAgain}
        onGoFeedback={goFeedback}
      />
    </CustomerLayout>
  );
}