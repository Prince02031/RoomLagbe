import { pool } from '../config/db.js';

export const ApartmentModel = {
  create: async (data) => {
    const query = `
      INSERT INTO APARTMENT (owner_id, location_id, name, address, total_rent, max_occupancy, type, women_only, available_from)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const values = [
      data.owner_id, data.location_id, data.name, data.address, 
      data.total_rent, data.max_occupancy, data.type, data.women_only, data.available_from
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  findByOwner: async (ownerId) => {
    const { rows } = await pool.query(
      `SELECT * FROM APARTMENT WHERE owner_id = $1`, [ownerId]
    );
    return rows;
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      `SELECT * FROM APARTMENT WHERE apartment_id = $1`, [id]
    );
    return rows[0];
  },

  findByLocation: async (locationId) => {
    const { rows } = await pool.query(
      `SELECT * FROM APARTMENT WHERE location_id = $1`, [locationId]
    );
    return rows;
  }
};