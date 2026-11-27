import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import AdminPageHeader from '../components/AdminPageHeader';
import Alert from '../components/Alert';
import ReportPeriodSelector from '../components/ReportPeriodSelector';
import ReportStats from '../components/ReportStats';
import ExpenseTable from '../components/ExpenseTable';
import RecordExpenseModal from '../components/RecordExpenseModal';
import { api } from '../store/api';
import { M, today, ago } from '../store/db';

export default function AdminReportsPage() {
  const [orders,   setOrders]   = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [period,   setPeriod]   = useState('weekly');
  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState({ d: '', a: '', t: today });
  const [formErrs, setFormErrs] = useState({});

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [ordRes, expRes] = await Promise.all([
        api.get('/orders'),
        api.get('/expenses'),
      ]);
      setOrders(ordRes.orders || []);
      setExpenses(expRes.expenses || []);
    } catch (e) {
      setError(e.message || 'Failed to load report data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const start = {
    weekly:  ago(6),
    monthly: today.slice(0, 8) + '01',
    yearly:  today.slice(0, 5) + '01-01',
  }[period];

  const delivered = orders.filter(
    o => o.status === 'Delivered' && o.created_at && o.created_at.slice(0, 10) >= start
  );
  const filteredExp = expenses.filter(e => e.expense_date >= start);

  const cost = o => (o.items || []).reduce((s, i) => s + (i.cost || 0) * i.quantity, 0);

  const rev    = delivered.reduce((t, o) => t + (o.total - (o.delivery_fee || 20)), 0);
  const cogs   = delivered.reduce((t, o) => t + cost(o), 0);
  const df     = delivered.reduce((t, o) => t + (o.delivery_fee || 20), 0);
  const ex     = filteredExp.reduce((t, e) => t + Number(e.amount), 0);
  const profit = rev - cogs;
  const net    = profit - df - ex;

  async function addExpense() {
    const x = {};
    if (!form.d.trim())         x.xd = 'This field is required.';
    if (!(Number(form.a) > 0))  x.xa = 'Amount must be greater than 0.';
    if (!form.t)                x.xt = 'Choose a date.';
    if (Object.keys(x).length) { setFormErrs(x); return; }

    try {
      await api.post('/expenses', {
        description:  form.d.trim(),
        amount:       Number(form.a),
        expense_date: form.t,
      });
      setModal(false); setForm({ d: '', a: '', t: today }); setFormErrs({});
      await loadData();
    } catch (e) {
      setFormErrs({ xd: e.message || 'Failed to record expense.' });
    }
  }

  async function deleteExpense(id) {
    try {
      await api.delete(`/expenses/${id}`);
      await loadData();
    } catch (e) {
      setError(e.message || 'Failed to delete expense.');
    }
  }

  return (
    <AdminLayout>
      <AdminPageHeader title="Reports and Analytics" subtitle="Revenue, profit, expenses, and net profit.">
      </AdminPageHeader>

      <Alert text={error} />

      <ReportPeriodSelector period={period} onChange={setPeriod} />

      {loading ? (
        <p className="muted">Loading report data…</p>
      ) : (
        <>
          <ReportStats
            rev={rev}
            profit={profit}
            df={df}
            ex={ex}
            net={net}
            delivered={delivered}
            M={M}
          />
          {delivered.length === 0 && filteredExp.length === 0 && (
            <Alert text="No records found for the selected period." />
          )}
        </>
      )}

      <ExpenseTable
        expenses={expenses}
        onAdd={() => { setForm({ d: '', a: '', t: today }); setFormErrs({}); setModal(true); }}
        onDelete={deleteExpense}
      />

      {modal && (
        <RecordExpenseModal
          form={form}
          setForm={setForm}
          formErrs={formErrs}
          onClose={() => setModal(false)}
          onSave={addExpense}
        />
      )}
    </AdminLayout>
  );
}