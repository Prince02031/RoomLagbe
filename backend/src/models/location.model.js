import { pool } from '../config/db.js';

export const LocationModel = {
  create: async (data) => {
    const query = `
      INSERT INTO LOCATION (area_name, latitude, longitude)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [data.area_name, data.latitude, data.longitude];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  findAll: async () => {
    const { rows } = await pool.query(`SELECT * FROM LOCATION`);
    return rows;
  }
};