import { pool } from '../config/db.js';

export const SavedSearchModel = {
  create: async (userId, searchCriteria) => {
    const query = `
      INSERT INTO saved_search (user_id, criteria)
      VALUES ($1, $2)
      RETURNING *;
    `;
    // searchCriteria is a JSON object
    const { rows } = await pool.query(query, [userId, searchCriteria]);
    return rows[0];
  },

  findByUser: async (userId) => {
    const query = `
      SELECT * FROM saved_search WHERE user_id = $1 ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      `SELECT * FROM saved_search WHERE saved_search_id = $1`, [id]
    );
    return rows[0];
  },

  remove: async (id) => {
    await pool.query(
      `DELETE FROM saved_search WHERE saved_search_id = $1`, [id]
    );
  }
};