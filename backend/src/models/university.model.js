import { pool } from '../config/db.js';

export const UniversityModel = {
  findAll: async () => {
    const { rows } = await pool.query(`SELECT * FROM UNIVERSITY`);
    return rows;
  }
};