import { pool } from '../config/db.js';

export const RoomModel = {
  create: async (data) => {
    const query = `
      INSERT INTO room (apartment_id, std_id, room_name, capacity, price_per_person, women_only)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [
      data.apartment_id, 
      data.std_id || null,
      data.room_name || data.room_number, 
      data.capacity, 
      data.price_per_person, 
      data.women_only || false
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  findByApartment: async (apartmentId) => {
    const { rows } = await pool.query(
      `SELECT * FROM room WHERE apartment_id = $1 ORDER BY room_name`, [apartmentId]
    );
    return rows;
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      `SELECT * FROM room WHERE room_id = $1`, [id]
    );
    return rows[0];
  },

  update: async (id, data) => {
    const fields = [];
    const values = [id];
    let paramCount = 2;

    // Build dynamic query
    if (data.room_name !== undefined) {
      fields.push(`room_name = $${paramCount++}`);
      values.push(data.room_name);
    }
    if (data.capacity !== undefined) {
      fields.push(`capacity = $${paramCount++}`);
      values.push(data.capacity);
    }
    if (data.price_per_person !== undefined) {
      fields.push(`price_per_person = $${paramCount++}`);
      values.push(data.price_per_person);
    }
    if (data.women_only !== undefined) {
      fields.push(`women_only = $${paramCount++}`);
      values.push(data.women_only);
    }

    if (fields.length === 0) return null;

    const query = `
      UPDATE room SET ${fields.join(', ')}
      WHERE room_id = $1
      RETURNING *;
    `;
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  remove: async (id) => {
    const { rows } = await pool.query(
      `DELETE FROM room WHERE room_id = $1 RETURNING *;`, [id]
    );
    return rows[0];
  }
};