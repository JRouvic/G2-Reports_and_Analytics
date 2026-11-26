import pool from '../config/db.js';

// read
export const fetch = async () => {
    const [rows] = await pool.query(
        "SELECT * FROM order_logs ORDER BY logged_at ASC"
    );
    return rows;
}

export const findByOrderId = async (orderId) => {
    const [rows] = await pool.query(
        "SELECT * FROM order_logs WHERE order_id = ? ORDER BY logged_at ASC",
        [orderId]
    );
    return rows;
}

// insert
export const insert = async (log) => {
    const [result] = await pool.query(
        "INSERT INTO order_logs (order_id, note) VALUES (?, ?)",
        [log.orderId, log.note]
    );
    return result.insertId;
}

// update
export const update = async (log) => {
    const [result] = await pool.query(
        "UPDATE order_logs SET note = ? WHERE id = ?",
        [log.note, log.id]
    );
    return result.affectedRows;
}

// delete
export const remove = async (id) => {
    const [result] = await pool.query(
        "DELETE FROM order_logs WHERE id = ?",
        [id]
    );
    return result.affectedRows;
}