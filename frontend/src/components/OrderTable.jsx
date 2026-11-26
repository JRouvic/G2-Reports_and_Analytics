import { Fragment } from 'react';
import { M, STEPS } from '../store/db';
import StatusPill from './StatusPill';
import AddressDisplay from './AddressDisplay';

const OrderTable = ({
  orders, loading, filter, onFilterChange,
  freeList, riderSel, onRiderSelect,
  onAccept, onAssign, openReject, open, onToggle,
}) => {
  return (
    <section className="codes">
      <div className="codes-head">
        <h2>Customer Orders (Cash on Delivery)</h2>
        <select value={filter} onChange={e => onFilterChange(e.target.value)}>
          <option value="all">All orders</option>
          <option value="rush">⚡ Rush only</option>
          {STEPS.map(s => <option key={s}>{s}</option>)}
          <option>Declined</option>
        </select>
      </div>

      {loading ? (
        <p className="muted">Loading orders…</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Order</th><th>Customer</th><th>Date</th>
              <th>Total</th><th>Status</th><th>Rider</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr><td colSpan={7} className="muted">No orders found.</td></tr>
            )}
            {orders.map(o => (
              <Fragment key={o.id}>
                <tr style={o.is_rush ? { background: '#FFF7ED', borderLeft: '4px solid #F97316' } : {}}>
                  <td>
                    <b>#{o.id}</b>
                    {!!o.is_rush && <span className="badge p-rush" style={{ marginLeft: 6 }}>⚡ Rush</span>}
                  </td>
                  <td>{o.customer_name}</td>
                  <td>{o.created_at ? o.created_at.slice(0, 10) : ''}</td>
                  <td>{M(o.total)}</td>
                  <td>
                    <StatusPill status={o.status} />
                    {o.status !== 'Declined' && (
                      <div className="mn">
                        {STEPS.map((s, k) => (
                          <i key={s} className={k <= STEPS.indexOf(o.status) ? 'on' : ''} />
                        ))}
                      </div>
                    )}
                    {o.decline_reason && <div className="muted small">{o.decline_reason}</div>}
                  </td>
                  <td>{o.rider_name || '—'}</td>
                  <td>
                    <div className="row">
                      {o.status === 'Pending' && (
                        <>
                          <button className="button small" onClick={() => onAccept(o.id)}>Accept</button>
                          <button className="button secondary small delete" onClick={() => openReject(o.id)}>Reject</button>
                        </>
                      )}
                      <button className="button secondary small" onClick={() => onToggle(o.id)}>
                        {open[o.id] ? 'Hide' : 'View'}
                      </button>
                    </div>
                  </td>
                </tr>
                {open[o.id] && (
                  <tr key={`det-${o.id}`} style={o.is_rush ? { background: '#FFF7ED' } : {}}>
                    <td colSpan={7} style={{ padding: '0 0 16px 0' }}>
            
                      <div className="stats" style={{ padding: '14px 20px', borderBottom: '1px solid var(--ln)' }}>
                        <div>
                          <span className="muted small">Customer</span>
                          <div><b>{o.customer_name}</b></div>
                          <AddressDisplay addr={o.address} empty={<span className="muted small">—</span>} />
                        </div>
                        <div>
                          <span className="muted small">Items</span>
                          <div>{(o.items || []).map(i => `${i.quantity} × ${i.name}`).join(', ')}</div>
                        </div>
                        <div>
                          <span className="muted small">Rider</span>
                          <div><b>{o.rider_name || 'Not assigned'}</b></div>
                        </div>
                        <div>
                          <span className="muted small">Cash collected</span>
                          <div><b className={o.cash_collected ? 'ok' : 'muted'}>
                            {o.cash_collected ? M(o.total) + ' confirmed' : 'Not yet'}
                          </b></div>
                        </div>
                        {!!o.is_rush && (
                          <div>
                            <span className="muted small">Priority</span>
                            <div><b style={{ color: '#C2410C' }}>⚡ Rush — ASAP</b></div>
                          </div>
                        )}
                      </div>

                      <div className="trk" style={{ margin: '14px 20px', border: '1px solid var(--ln)' }}>
                        {o.status === 'Declined' ? (
                          <>
                            <div className="bad-text st-title">Declined</div>
                            {o.decline_reason && <p className="muted small">{o.decline_reason}</p>}
                          </>
                        ) : (
                          <>
                            <div>
                              <div className={`st-title ${o.status === 'Delivered' ? 'ok' : ''}`}>{o.status}</div>
                              <div className={o.status === 'Delivered' ? 'ok strong' : 'strong'}>
                                {o.status === 'Delivered'
                                  ? `Delivered on ${o.want_date ? new Date(o.want_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}`
                                  : `Delivery: ${o.want_date || '—'}`}
                              </div>
                              <p className="muted small">
                                Cash on Delivery · {M(o.total)}{o.rider_name ? ` · Rider: ${o.rider_name}` : ''}
                              </p>
                            </div>

                            <div className="stp">
                              {STEPS.map((s, k) => {
                                const idx = STEPS.indexOf(o.status);
                                const fin  = o.status === 'Delivered';
                                const done = k < idx || fin;
                                const cur  = k === idx && !fin;
                                return (
                                  <div key={s} className={done ? 'on' : ''}>
                                    <i className={`dot ${done ? 'dn' : cur ? 'cu' : ''}`}>
                                      {done ? '✓' : ''}
                                    </i>
                                    <span className={`small ${done || cur ? 'ok' : 'muted'} ${cur ? 'cur' : ''}`}>{s}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}

                        {(o.logs || []).length > 0 && (
                          <div className="tl">
                            {[...o.logs].reverse().map((l, i) => {
                              const dt   = new Date(l.logged_at);
                              const date = l.logged_at ? dt.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                              const time = l.logged_at ? dt.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' }) : '';
                              return (
                                <div key={i} className="ev">
                                  <div className="evd small">{date}<br />{time}</div>
                                  <i className={`evp ${i === 0 ? 'g' : ''}`} />
                                  <div className={`small ${i > 0 ? 'muted' : ''}`}>
                                    {i === 0 && <span className="nw" style={{ marginRight: 6 }}>NEW</span>}
                                    {l.note}
                                    {l.note === 'Rider uploaded proof of delivery' && o.proof_image && (
                                      o.proof_image.startsWith('data:')
                                        ? <img src={o.proof_image} alt="Proof of delivery" className="proof-img" />
                                        : <div className="proof-ph">[Photo: {o.proof_image}]</div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default OrderTable;