import pool from '../config/db.js';

// read
export const fetch = async () => {
    const [rows] = await pool.query(
        `SELECT r.*, CONCAT(u.first_name, ' ', u.last_name) AS name, u.email
         FROM riders r
         JOIN users u ON r.user_id = u.id
         ORDER BY r.id ASC`
    );
    return rows;
}

export const findRiderById = async (id) => {
    const [rows] = await pool.query(
        `SELECT r.*, CONCAT(u.first_name, ' ', u.last_name) AS name, u.email, u.first_name, u.last_name
         FROM riders r
         JOIN users u ON r.user_id = u.id
         WHERE r.id = ?`,
        [id]
    );
    return rows;
}

export const findRiderByUserId = async (userId) => {
    const [rows] = await pool.query(
        "SELECT * FROM riders WHERE user_id = ?",
        [userId]
    );
    return rows;
}

// insert
export const insert = async (rider) => {
    const [result] = await pool.query(
        "INSERT INTO riders (user_id, mobile, status) VALUES (?, ?, 'Active')",
        [rider.userId, rider.mobile]
    );
    return result.insertId;
}

// update
export const update = async (rider) => {
    const [result] = await pool.query(
        "UPDATE riders SET mobile = ?, status = ? WHERE id = ?",
        [rider.mobile, rider.status || 'Active', rider.id]
    );
    return result.affectedRows;
}

// delete
export const remove = async (id) => {
    const [result] = await pool.query(
        "UPDATE riders SET status = 'Resigned' WHERE id = ?",
        [id]
    );
    return result.affectedRows;
}