import { pool } from '../config/db.js';

export const AmenityModel = {
  create: async (name) => {
    const { rows } = await pool.query(
      `INSERT INTO AMENITY (name) VALUES ($1) RETURNING *;`,
      [name]
    );
    return rows[0];
  },

  findAll: async () => {
    const { rows } = await pool.query(`SELECT * FROM AMENITY ORDER BY name`);
    return rows;
  },

  remove: async (id) => {
    await pool.query(`DELETE FROM AMENITY WHERE amenity_id = $1`, [id]);
  },

  findByApartment: async (apartmentId) => {
    const query = `
      SELECT a.* FROM AMENITY a
      JOIN APARTMENT_AMENITY aa ON a.amenity_id = aa.amenity_id
      WHERE aa.apartment_id = $1
      ORDER BY a.name;
    `;
    const { rows } = await pool.query(query, [apartmentId]);
    return rows;
  },

  findByRoom: async (roomId) => {
    const query = `
      SELECT a.* FROM AMENITY a
      JOIN ROOM_AMENITY ra ON a.amenity_id = ra.amenity_id
      WHERE ra.room_id = $1
      ORDER BY a.name;
    `;
    const { rows } = await pool.query(query, [roomId]);
    return rows;
  },

  addApartmentAmenity: async (apartmentId, amenityId) => {
    const query = `
      INSERT INTO APARTMENT_AMENITY (apartment_id, amenity_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING;
    `;
    await pool.query(query, [apartmentId, amenityId]);
  },

  removeApartmentAmenity: async (apartmentId, amenityId) => {
    await pool.query(
      `DELETE FROM APARTMENT_AMENITY WHERE apartment_id = $1 AND amenity_id = $2`,
      [apartmentId, amenityId]
    );
  },

  addRoomAmenity: async (roomId, amenityId) => {
    const query = `
      INSERT INTO ROOM_AMENITY (room_id, amenity_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING;
    `;
    await pool.query(query, [roomId, amenityId]);
  },

  removeRoomAmenity: async (roomId, amenityId) => {
    await pool.query(
      `DELETE FROM ROOM_AMENITY WHERE room_id = $1 AND amenity_id = $2`,
      [roomId, amenityId]
    );
  }
};