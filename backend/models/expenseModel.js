import pool from '../config/db.js';

// read
export const fetch = async () => {
    const [rows] = await pool.query(
        "SELECT * FROM expenses ORDER BY expense_date DESC, created_at DESC"
    );
    return rows;
}

export const findExpenseById = async (id) => {
    const [rows] = await pool.query(
        "SELECT * FROM expenses WHERE id = ?",
        [id]
    );
    return rows;
}

// insert
export const insert = async (expense) => {
    const [result] = await pool.query(
        "INSERT INTO expenses (description, amount, expense_date) VALUES (?, ?, ?)",
        [expense.description, expense.amount, expense.expenseDate]
    );
    return result.insertId;
}

// update
export const update = async (expense) => {
    const [result] = await pool.query(
        "UPDATE expenses SET description = ?, amount = ?, expense_date = ? WHERE id = ?",
        [expense.description, expense.amount, expense.expenseDate, expense.id]
    );
    return result.affectedRows;
}

// delete
export const remove = async (id) => {
    const [result] = await pool.query(
        "DELETE FROM expenses WHERE id = ?",
        [id]
    );
    return result.affectedRows;
}