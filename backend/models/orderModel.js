import pool from '../config/db.js';

// read all

export const fetch = async () => {
    const [rows] = await pool.query(
        `SELECT o.*, CONCAT(u.first_name, ' ', u.last_name) AS customer_name, u.email,
                CONCAT(ru.first_name, ' ', ru.last_name) AS rider_name
         FROM orders o
         JOIN users u ON o.user_id = u.id
         LEFT JOIN riders r ON o.rider_id = r.id
         LEFT JOIN users ru ON r.user_id = ru.id
         ORDER BY o.created_at DESC`
    );
    return rows;
}

export const findOrdersByUser = async (userId) => {
    const [rows] = await pool.query(
        `SELECT o.*, CONCAT(u.first_name, ' ', u.last_name) AS customer_name, u.email,
                CONCAT(ru.first_name, ' ', ru.last_name) AS rider_name
         FROM orders o
         JOIN users u ON o.user_id = u.id
         LEFT JOIN riders r ON o.rider_id = r.id
         LEFT JOIN users ru ON r.user_id = ru.id
         WHERE o.user_id = ?
         ORDER BY o.created_at DESC`,
        [userId]
    );
    return rows;
}

export const findOrdersByRider = async (riderId) => {
    const [rows] = await pool.query(
        `SELECT o.*, CONCAT(u.first_name, ' ', u.last_name) AS customer_name,
                CONCAT(ru.first_name, ' ', ru.last_name) AS rider_name
         FROM orders o
         JOIN users u ON o.user_id = u.id
         LEFT JOIN riders r ON o.rider_id = r.id
         LEFT JOIN users ru ON r.user_id = ru.id
         WHERE o.rider_id = ? AND o.status IN ('Out for delivery','Delivered')
         ORDER BY o.created_at DESC`,
        [riderId]
    );
    return rows;
}

export const findOrderById = async (id) => {
    const [rows] = await pool.query(
        `SELECT o.*, CONCAT(u.first_name, ' ', u.last_name) AS customer_name, u.email,
                CONCAT(ru.first_name, ' ', ru.last_name) AS rider_name
         FROM orders o
         JOIN users u ON o.user_id = u.id
         LEFT JOIN riders r ON o.rider_id = r.id
         LEFT JOIN users ru ON r.user_id = ru.id
         WHERE o.id = ?`,
        [id]
    );
    return rows;
}

// insert
export const insert = async (order) => {
    const [result] = await pool.query(
        `INSERT INTO orders (user_id, customer_name, address, want_date, is_rush, subtotal, discount, promo_code, delivery_fee, total, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
        [order.userId, order.customerName, order.address, order.wantDate,
         order.isRush ? 1 : 0,
         order.subtotal, order.discount || 0, order.promoCode || null,
         order.deliveryFee, order.total]
    );
    return result.insertId;
}

// update
export const update = async (order) => {
    const [result] = await pool.query(
        "UPDATE orders SET status = ?, decline_reason = ? WHERE id = ?",
        [order.status, order.declineReason || null, order.id]
    );
    return result.affectedRows;
}

export const updateRider = async (id, riderId) => {
    const [result] = await pool.query(
        "UPDATE orders SET rider_id = ?, status = 'Out for delivery' WHERE id = ?",
        [riderId, id]
    );
    return result.affectedRows;
}

export const updateCash = async (id) => {
    const [result] = await pool.query(
        "UPDATE orders SET cash_collected = 1 WHERE id = ?",
        [id]
    );
    return result.affectedRows;
}

export const updateProof = async (id, proofImage) => {
    const [result] = await pool.query(
        "UPDATE orders SET proof_image = ? WHERE id = ?",
        [proofImage, id]
    );
    return result.affectedRows;
}