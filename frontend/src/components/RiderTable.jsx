const RiderTable = ({ riders, loading, M, onEdit, onResign, onReactivate }) => {
  return (
    <section className="codes">
      <h2>All riders</h2>
      {loading ? (
        <p className="muted">Loading riders…</p>
      ) : (
        <table>
          <thead>
            <tr><th>Rider</th><th>Contact</th><th>Status</th><th>Current order</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {riders.length === 0 && <tr><td colSpan={5} className="muted">No riders yet.</td></tr>}
            {riders.map(r => {
              const hasOrder = !!r.currentOrder;
              const st  = r.status === 'Resigned' ? 'Resigned' : hasOrder ? 'Out for delivery' : 'Available';
              const cls = { Available: 'p-Available', 'Out for delivery': 'p-Out', Resigned: 'p-Resigned' };
              return (
                <tr key={r.id}>
                  <td><b>{r.name}</b><div className="rider-mail">{r.email}</div></td>
                  <td>{r.mobile}</td>
                  <td><span className={`badge ${cls[st]}`}>{st}</span></td>
                  <td>{hasOrder ? `#${r.currentOrder.order_id} · ${M(r.currentOrder.total)}` : '—'}</td>
                  <td>
                    <div className="row">
                      <button className="button secondary small" onClick={() => onEdit(r)}>Edit</button>
                      {r.status === 'Resigned'
                        ? <button className="button secondary small" onClick={() => onReactivate(r.id, r.name)}>Reactivate</button>
                        : <button className="button secondary small delete" onClick={() => onResign(r)}>Resign</button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default RiderTable;