import { pool } from '../config/db.js';

export const LocationModel = {
  create: async (data) => {
    const query = `
      INSERT INTO "location" (area_name, latitude, longitude)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [data.area_name, data.latitude, data.longitude];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  findAll: async () => {
    const { rows } = await pool.query(`SELECT * FROM "location" ORDER BY area_name`);
    return rows;
  },
  
  findById: async (id) => {
    const { rows } = await pool.query(
      `SELECT * FROM "location" WHERE location_id = $1`, [id]
    );
    return rows[0];
  },
  
  findByName: async (areaName) => {
    const { rows } = await pool.query(
      `SELECT * FROM "location" WHERE area_name ILIKE $1`, [`%${areaName}%`]
    );
    return rows;
  }
};