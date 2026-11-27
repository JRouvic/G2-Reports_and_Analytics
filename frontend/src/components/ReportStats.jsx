const ReportStats = ({ rev, profit, df, ex, net, delivered, M }) => {
  return (
    <>
      <div className="stats">
        <div className="card stat"><span className="muted small">Revenue</span><b>{M(rev)}</b></div>
        <div className="card stat"><span className="muted small">Profit</span><b>{M(profit)}</b></div>
        <div className="card stat"><span className="muted small">Delivery fees + expenses</span><b>{M(df + ex)}</b></div>
        <div className="card stat net"><span className="muted small">Net profit</span><b className={net < 0 ? 'bad-text' : 'ok'}>{M(net)}</b></div>
      </div>

      {delivered.length > 0 && (
        <section className="codes">
          <h2>Delivered orders</h2>
          <table>
            <thead>
              <tr><th>Order</th><th>Date</th><th>Revenue</th><th>Cost of products</th></tr>
            </thead>
            <tbody>
              {delivered.map(o => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.created_at ? o.created_at.slice(0, 10) : ''}</td>
                  <td>{M(o.total)}</td>
                  <td>{M((o.items || []).reduce((s, i) => s + (i.cost || 0) * i.quantity, 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
};

export default ReportStats;