import { M } from '../store/db';

const ExpenseTable = ({ expenses, onAdd, onDelete }) => {
  return (
    <section className="codes noprint">
      <div className="codes-head">
        <h2>Recorded expenses</h2>
        <button className="button small" onClick={onAdd}>
          Record Expense
        </button>
      </div>
      <table>
        <thead><tr><th>Date</th><th>Description</th><th>Amount</th><th></th></tr></thead>
        <tbody>
          {expenses.length === 0
            ? <tr><td colSpan={4} className="muted">No expenses recorded.</td></tr>
            : expenses.map(e => (
                <tr key={e.id}>
                  <td>{e.expense_date}</td>
                  <td>{e.description}</td>
                  <td>{M(e.amount)}</td>
                  <td>
                    <button className="button secondary small delete" onClick={() => onDelete(e.id)}>Delete</button>
                  </td>
                </tr>
              ))
          }
        </tbody>
      </table>
    </section>
  );
};

export default ExpenseTable;