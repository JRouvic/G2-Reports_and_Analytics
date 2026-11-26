
import { M } from '../store/db';

const RiderList = ({
  orders, loading, open, onToggle,
  amounts, onAmountChange, checks, onCheckChange,
  errs, onConfirmCash, onUploadProof, onMarkDelivered,
}) => {
  if (loading) {
    return <div className="card muted">Loading deliveries…</div>;
  }

  return (
    <div className="col">
      {orders.length === 0 && <div className="card muted">No deliveries assigned yet.</div>}
      {orders.map(o => (
        <div className="card acc" key={o.id}>
          <button className="sum" onClick={() => onToggle(o.id)} aria-expanded={!!open[o.id]}>
            <span>
              <b>Order #{o.id}</b>
              {!!o.is_rush && <span className="badge p-rush" style={{ marginLeft: 8 }}>⚡ Rush</span>}
              <span className="muted small db">{o.customer_name}</span>
            </span>
            <b>{M(o.total)}</b>
            <span className={`badge ${o.status === 'Delivered' ? 'p-Delivered' : 'p-Out'}`}>{o.status}</span>
            <i className="chv" />
          </button>

          {open[o.id] && (
            <div className="bd">
              <div className="muted small">
                {o.address} · {(o.items || []).map(i => `${i.quantity} × ${i.name}`).join(', ')} · Cash on Delivery
              </div>
              {!!o.is_rush && (
                <div className="rush-rider-note">
                  ⚡ <b>Rush order</b> — customer needs this delivered ASAP.
                </div>
              )}

              {o.status === 'Delivered' ? (
                <p className="good">Cash {M(o.total)} collected · Proof uploaded</p>
              ) : (
                <>
                  <div className="collect">
                    <b>Amount to collect</b><b>{M(o.total)}</b>
                  </div>

                  <b>1 · Collect cash</b>
                  {o.cash_collected ? (
                    <p className="good">Cash confirmed</p>
                  ) : (
                    <>
                      <div className="cash-row">
                        <input
                          placeholder="Amount collected"
                          inputMode="decimal"
                          className={errs[o.id] ? 'bad' : ''}
                          value={amounts[o.id] || ''}
                          onChange={e => onAmountChange(o.id, e.target.value)}
                        />
                        <button className="button" onClick={() => onConfirmCash(o.id)}>Confirm</button>
                      </div>
                      {errs[o.id] && <p className="er">{errs[o.id]}</p>}
                      <label className="check">
                        <input type="checkbox"
                          checked={!!checks[o.id]}
                          onChange={e => onCheckChange(o.id, e.target.checked)} />
                        I received the full cash payment
                      </label>
                    </>
                  )}

                  <b>2 · Proof of delivery</b>
                  {o.proof_image ? (
                    <p className="good">Proof uploaded</p>
                  ) : (
                    <input type="file" accept="image/*"
                      onChange={e => onUploadProof(o.id, e.target.files[0])} />
                  )}

                  <b>3 · Complete</b>
                  <button className="button" disabled={!o.cash_collected || !o.proof_image}
                    onClick={() => onMarkDelivered(o.id)}>
                    Mark as Delivered
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RiderList;