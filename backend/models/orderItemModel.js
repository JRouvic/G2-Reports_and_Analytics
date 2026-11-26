import pool from '../config/db.js';

// read
export const fetch = async () => {
    const [rows] = await pool.query(
        `SELECT oi.*, i.name, i.description, i.cost
         FROM order_items oi
         JOIN items i ON oi.item_id = i.id`
    );
    return rows;
}

export const findByOrderId = async (orderId) => {
    const [rows] = await pool.query(
        `SELECT oi.*, i.name, i.description, i.cost
         FROM order_items oi
         JOIN items i ON oi.item_id = i.id
         WHERE oi.order_id = ?`,
        [orderId]
    );
    return rows;
}

// insert 
export const insert = async (orderItem) => {
    const values = orderItem.items.map(i => [orderItem.orderId, i.itemId, i.quantity, i.price]);
    const [result] = await pool.query(
        "INSERT INTO order_items (order_id, item_id, quantity, price) VALUES ?",
        [values]
    );
    return result.insertId;
}

// update
export const update = async (orderItem) => {
    const [result] = await pool.query(
        "UPDATE order_items SET quantity = ?, price = ? WHERE id = ?",
        [orderItem.quantity, orderItem.price, orderItem.id]
    );
    return result.affectedRows;
}

// delete
export const remove = async (id) => {
    const [result] = await pool.query(
        "DELETE FROM order_items WHERE id = ?",
        [id]
    );
    return result.affectedRows;
}