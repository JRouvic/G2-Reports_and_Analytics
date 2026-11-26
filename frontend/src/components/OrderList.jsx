import { Link } from 'react-router-dom';
import { M, STEPS } from '../store/db';
import StatusPill from './StatusPill';
import AddressDisplay from './AddressDisplay';

function Tracker({ order }) {
  const i   = STEPS.indexOf(order.status);
  const dec = order.status === 'Declined';
  const fin = order.status === 'Delivered';

  const MSG = t => {
    const m = {
      'Order placed by customer':         'Your order has been placed. Waiting for 3A\'s Kitchen to confirm it.',
      'Accepted by admin':                'Your order was accepted and is being prepared.',
      'Rider confirmed cash collected':   'Cash payment received by your rider.',
      'Rider uploaded proof of delivery': 'Proof of delivery photo uploaded.',
      'Rider marked order as delivered':  'Your order has been delivered. Enjoy your meal!',
    };
    if (m[t]) return m[t];
    if (t.startsWith('Assigned to ')) return `${t.slice(12)} picked up your order and is on the way.`;
    return t;
  };

  const fd = d => new Date(d + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

  const events = (() => {
    if (order.logs?.length) {
      return [...order.logs]
        .sort((a, b) => new Date(b.logged_at) - new Date(a.logged_at))
        .map(l => {
          const dt   = new Date(l.logged_at);
          const date = dt.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
          const time = dt.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
          return [date, time, l.note];
        });
    }
    if (dec) return [[fd(order.created_at?.slice(0, 10) || ''), '', 'Rejected by admin']];
    const a = ['Order placed by customer'];
    if (i >= 1) a.push('Accepted by admin');
    if (i >= 2) a.push('Assigned to ' + (order.rider_name || 'a rider'));
    if (order.cash_collected)  a.push('Rider confirmed cash collected');
    if (order.proof_image)     a.push('Rider uploaded proof of delivery');
    if (i >= 3) a.push('Rider marked order as delivered');
    const dateStr = fd(order.created_at?.slice(0, 10) || '');
    return a.map(t => [dateStr, '', t]).reverse();
  })();

  const orderDate   = order.created_at?.slice(0, 10) || '';
  const deliverDate = order.want_date || orderDate;

  return (
    <div className="trk">
  
      {dec ? (
        <div>
          <div className="bad-text st-title">Declined</div>
          <p className="muted small">3A&apos;s Kitchen could not accept this order. Reason: {order.decline_reason}</p>
        </div>
      ) : (
        <div>
          <div className="ok st-title">{order.status}</div>
          <div className="ok strong">
            {fin ? 'Delivered on ' + fd(orderDate) : 'Delivery: ' + fd(deliverDate)}
          </div>
          <p className="muted small">
            Cash on Delivery · {M(order.total)}
            {order.rider_name ? ` · Rider: ${order.rider_name}` : ''}
          </p>
        </div>
      )}

      {!dec && (
        <div className="stp">
          {STEPS.map((s, k) => (
            <div key={s} className={k <= i ? 'on' : ''}>
              <i className={`dot ${k < i || fin ? 'dn' : k === i ? 'cu' : ''}`}>
                {(k < i || fin) ? '✓' : ''}
              </i>
              <span className={`${k > i ? 'muted' : 'ok'} ${k === i ? 'cur' : ''} small`}>{s}</span>
            </div>
          ))}
        </div>
      )}

      {!dec && !fin && (
        <div className="nt">
          {{ Pending:            'Your order is waiting for 3A\'s Kitchen to confirm it.',
             Accepted:           'Your order was accepted. A rider will be assigned soon.',
             'Out for delivery': `Your order is on the way. Please prepare ${M(order.total)} in cash for the rider.`
          }[order.status]}
        </div>
      )}

      <div className="tl">
        {events.map(([date, time, text], k) => (
          <div key={k} className="ev">
            <div className="evd small">{date}<br />{time}</div>
            <i className={`evp ${k === 0 ? 'g' : ''}`} />
            <div className={`small ${k ? 'muted' : ''}`}>
              {k === 0 && <span className="nw">NEW</span>}{' '}
              {MSG(text)}
              {text === 'Rider uploaded proof of delivery' && order.proof_image && (
                order.proof_image.startsWith('data:')
                  ? <img src={order.proof_image} alt="Proof of delivery" className="proof-img" />
                  : <div className="proof-ph">[Photo: {order.proof_image}]</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const OrderList = ({ orders, loading, open, onToggle, onOrderAgain, onGoFeedback }) => {
  return (
    <div className="col">
      {loading && <div className="card muted">Loading your orders…</div>}

      {!loading && orders.length === 0 && (
        <div className="card muted">
          You have no orders yet. Go to the <Link to="/menu">menu</Link> to place your first order.
        </div>
      )}

      {orders.map(o => {
        const itemCount = (o.items || []).length;
        const orderDate = o.created_at?.slice(0, 10) || '';

        return (
          <div className="card acc" key={o.id}>
            <button className="sum" onClick={() => onToggle(o.id)}
              aria-expanded={!!open[o.id]}>
              <span>
                <b>Order #{o.id}</b>
                <span className="muted small db">{orderDate} · {itemCount} item{itemCount !== 1 ? 's' : ''}</span>
              </span>
              <b>{M(o.total)}</b>
              <StatusPill status={o.status} />
              <i className="chv" />
            </button>

            {open[o.id] && (
              <div className="bd">
                <Tracker order={o} />

                {(o.items || []).map(it => (
                  <div key={it.item_id} className="line">
                    <span>{it.quantity} × {it.name}</span>
                    <span className="muted">{M(it.price * it.quantity)}</span>
                  </div>
                ))}
                {o.discount > 0 && (
                  <div className="line ok">
                    <span>Code {o.promo_code}</span>
                    <span>−{M(o.discount)}</span>
                  </div>
                )}
                <div className="line muted">
                  <span>Delivery fee</span><span>{M(o.delivery_fee ?? 20)}</span>
                </div>
                {o.is_rush ? (
                  <div className="line muted">
                    <span>Rush fee (included)</span><span>{M(80)}</span>
                  </div>
                ) : null}
                <div className="line"><b>Total</b><b>{M(o.total)}</b></div>
                <div className="muted small">
                  Cash on Delivery{o.rider_name ? ` · Rider ${o.rider_name}` : ''}
                </div>
                <AddressDisplay addr={o.address} />

                <div className="row">
                  {o.status === 'Delivered' && !o.has_feedback && (
                    <button className="button" onClick={() => onGoFeedback(o.id)}>Give Feedback</button>
                  )}
                  {(o.status === 'Delivered' || o.status === 'Declined') && (
                    <button className="button secondary" onClick={() => onOrderAgain(o)}>Order Again</button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrderList;