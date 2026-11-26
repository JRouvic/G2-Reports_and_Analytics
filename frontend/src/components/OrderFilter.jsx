const OrderFilter = ({ filter, setFilter }) => {
  const FILTERS = ['all', 'Active', 'Delivered', 'Declined'];
  return (
    <div className="row" style={{ gap: 8 }}>
      {FILTERS.map(f => (
        <button key={f} style={{ borderRadius: 99, padding: '6px 14px', fontSize: 13 }}
          className={`button${filter === f ? '' : ' secondary'}`}
          onClick={() => setFilter(f)}>
          {f === 'all' ? 'All' : f}
        </button>
      ))}
    </div>
  );
};

export default OrderFilter;