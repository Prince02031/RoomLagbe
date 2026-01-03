import { pool } from '../config/db.js';

export const RoomModel = {
  create: async (data) => {
    const query = `
      INSERT INTO ROOM (apartment_id, room_number, capacity, price_per_person, women_only)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [
      data.apartment_id, data.room_number, data.capacity, 
      data.price_per_person, data.women_only
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  findByApartment: async (apartmentId) => {
    const { rows } = await pool.query(
      `SELECT * FROM ROOM WHERE apartment_id = $1`, [apartmentId]
    );
    return rows;
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      `SELECT * FROM ROOM WHERE room_id = $1`, [id]
    );
    return rows[0];
  },

  update: async (id, data) => {
    // Dynamically build the update query based on provided data
    const fields = Object.keys(data);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [id, ...Object.values(data)];

    const query = `
      UPDATE ROOM SET ${setClause}
      WHERE room_id = $1
      RETURNING *;
    `;
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  remove: async (id) => {
    const { rows } = await pool.query(
      `DELETE FROM ROOM WHERE room_id = $1 RETURNING *;`, [id]
    );
    return rows[0];
  }
};