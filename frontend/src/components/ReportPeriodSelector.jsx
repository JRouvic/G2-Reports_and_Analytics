const ReportPeriodSelector = ({ period, onChange }) => {
  return (
    <div className="card row noprint" style={{ gap: 8 }}>
      {['weekly', 'monthly', 'yearly'].map(p => (
        <button key={p} className={`button${period === p ? '' : ' secondary'}`}
          onClick={() => onChange(p)} style={{ textTransform: 'capitalize' }}>{p}</button>
      ))}
    </div>
  );
};

export default ReportPeriodSelector;