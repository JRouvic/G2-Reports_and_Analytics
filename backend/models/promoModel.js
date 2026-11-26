import pool from '../config/db.js';

// read
export const fetch = async () => {
    const [rows] = await pool.query(
        "SELECT * FROM promos ORDER BY created_at DESC"
    );
   return rows;
}

export const findPromoByCode = async (code) => {
   const [rows] = await pool.query(
        "SELECT * FROM promos WHERE code = ?",
        [code]
    );
    return rows;
}

// insert
export const insert = async (promo) => {
    const [result] = await pool.query(
        `INSERT INTO promos (code, type, value, min_order, expires_on, enabled, usage_limit, once_per_user)
         VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
        [promo.code, promo.type, promo.value, promo.minOrder || 0,
         promo.expiresOn, promo.usageLimit || null, promo.oncePerUser ? 1 : 0]
    );
    return result.insertId;
}

// update
export const update = async (promo) => {
    const [result] = await pool.query(
        "UPDATE promos SET enabled = ? WHERE code = ?",
        [promo.enabled ? 1 : 0, promo.code]
    );
    return result.affectedRows;
}

// delete
export const remove = async (code) => {
    const [result] = await pool.query(
        "DELETE FROM promos WHERE code = ?",
        [code]
    );
    return result.affectedRows;
}

export const incrementUsed = async (code) => {
    await pool.query(
        [code]
    );
}

export const decrementUsed = async (code) => {
    await pool.query(
        "UPDATE promos SET used_count = GREATEST(used_count - 1, 0) WHERE code = ?",
        [code]
    );
}