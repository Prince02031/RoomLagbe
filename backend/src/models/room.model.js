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
  }
};