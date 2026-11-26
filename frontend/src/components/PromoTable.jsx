const PromoTable = ({ promos, loading, onToggle, onDelete, statusLabel, statusClass, isDone, M, fd }) => {
  return (
    <section className="codes">
      <h2>All codes</h2>
      {loading ? (
        <p className="muted">Loading promos…</p>
      ) : (
       <table>
          <thead>
            <tr><th>Code</th><th>Discount</th><th>Min. Order</th><th>Used</th><th>Expires</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
           {promos.length === 0 && <tr><td colSpan={7} className="muted">No discount codes yet.</td></tr>}
           {promos.map(p => {
              const dead = isDone(p);
              const used = p.used_count || 0;
              const pct  = p.usage_limit ? Math.min(100, Math.round(used / p.usage_limit * 100)) : 0;
              return (
                <tr key={p.code}>
                  <td className="code">{p.code}</td>
                <td>{p.type === '%' ? `${p.value}% off` : `${M(p.value)} off`}</td>
                  <td>{M(p.min_order)}</td>
                  <td>
                    {used}{p.usage_limit ? ` / ${p.usage_limit}` : ' (no limit)'}
                    {p.usage_limit && <div className="bar"><span style={{ width: `${pct}%` }} /></div>}
                    {p.once_per_user && <div className="used-note">1 per customer</div>}
                  </td>
                 <td>{fd(p.expires_on)}</td>
                  <td><span className={`badge ${statusClass(p)}`}>{statusLabel(p)}</span></td>
                  <td>
                    <div className="row">
                      {!dead && (
                        <button className="button secondary small" onClick={() => onToggle(p.code)}>
                          {p.enabled ? 'Disable' : 'Enable'}
                        </button>
                      )}
                      <button className="button secondary small delete" onClick={() => onDelete(p.code)}>Delete</button>
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

export default PromoTable;