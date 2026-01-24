import { pool } from '../config/db.js';

export const AmenityModel = {
  create: async (name) => {
    const { rows } = await pool.query(
      `INSERT INTO amenity (name) VALUES ($1) RETURNING *;`,
      [name]
    );
    return rows[0];
  },

  findAll: async () => {
    const { rows } = await pool.query(`SELECT * FROM amenity ORDER BY name`);
    return rows;
  },

  remove: async (id) => {
    await pool.query(`DELETE FROM amenity WHERE amenity_id = $1`, [id]);
  },

  findByApartment: async (apartmentId) => {
    const query = `
      SELECT a.* FROM amenity a
      JOIN apartment_amenity aa ON a.amenity_id = aa.amenity_id
      WHERE aa.apartment_id = $1
      ORDER BY a.name;
    `;
    const { rows } = await pool.query(query, [apartmentId]);
    return rows;
  },

  findByRoom: async (roomId) => {
    const query = `
      SELECT a.* FROM amenity a
      JOIN room_amenity ra ON a.amenity_id = ra.amenity_id
      WHERE ra.room_id = $1
      ORDER BY a.name;
    `;
    const { rows } = await pool.query(query, [roomId]);
    return rows;
  },

  addApartmentAmenity: async (apartmentId, amenityId) => {
    const query = `
      INSERT INTO apartment_amenity (apartment_id, amenity_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING;
    `;
    await pool.query(query, [apartmentId, amenityId]);
  },

  removeApartmentAmenity: async (apartmentId, amenityId) => {
    await pool.query(
      `DELETE FROM apartment_amenity WHERE apartment_id = $1 AND amenity_id = $2`,
      [apartmentId, amenityId]
    );
  },

  addRoomAmenity: async (roomId, amenityId) => {
    const query = `
      INSERT INTO room_amenity (room_id, amenity_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING;
    `;
    await pool.query(query, [roomId, amenityId]);
  },

  removeRoomAmenity: async (roomId, amenityId) => {
    await pool.query(
      `DELETE FROM room_amenity WHERE room_id = $1 AND amenity_id = $2`,
      [roomId, amenityId]
    );
  }
};