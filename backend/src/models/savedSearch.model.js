import { pool } from '../config/db.js';

export const SavedSearchModel = {
  create: async (userId, searchCriteria) => {
    const query = `
      INSERT INTO SAVED_SEARCH (user_id, criteria)
      VALUES ($1, $2)
      RETURNING *;
    `;
    // searchCriteria is a JSON object
    const { rows } = await pool.query(query, [userId, searchCriteria]);
    return rows[0];
  },

  findByUser: async (userId) => {
    const query = `
      SELECT * FROM SAVED_SEARCH WHERE user_id = $1 ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }
};