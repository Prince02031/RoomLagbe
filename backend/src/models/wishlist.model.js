import { pool } from '../config/db.js';

export const WishlistModel = {
  add: async (userId, listingId) => {
    const query = `
      INSERT INTO WISHLIST (user_id, listing_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, listing_id) DO NOTHING
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [userId, listingId]);
    return rows[0];
  },

  remove: async (userId, listingId) => {
    await pool.query(`DELETE FROM WISHLIST WHERE user_id = $1 AND listing_id = $2`, [userId, listingId]);
  },

  getByUser: async (userId) => {
    const query = `
      SELECT w.*, l.* FROM WISHLIST w
      JOIN LISTING l ON w.listing_id = l.listing_id
      WHERE w.user_id = $1
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  },

  getTopWishlisted: async (limit = 10) => {
    const query = `
      SELECT listing_id, COUNT(*) as count 
      FROM WISHLIST 
      GROUP BY listing_id 
      ORDER BY count DESC 
      LIMIT $1
    `;
    const { rows } = await pool.query(query, [limit]);
    return rows;
  }
};