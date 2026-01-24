import { pool } from '../config/db.js';

export const UniversityModel = {
  findAll: async () => {
    const { rows } = await pool.query(`SELECT * FROM university ORDER BY name`);
    return rows;
  },
  
  findById: async (id) => {
    const { rows } = await pool.query(
      `SELECT * FROM university WHERE university_id = $1`, [id]
    );
    return rows[0];
  }
};