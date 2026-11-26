import { M } from '../store/db';

const RiderStats = ({ cashTodo, cashGot, completed, total }) => {
  return (
    <div className="stats">
      <div className="card stat"><span className="muted small">Cash to collect</span><b>{M(cashTodo)}</b></div>
      <div className="card stat"><span className="muted small">Collected</span><b className="ok">{M(cashGot)}</b></div>
      <div className="card stat"><span className="muted small">Completed</span><b>{completed} of {total}</b></div>
    </div>
  );
};

export default RiderStats;