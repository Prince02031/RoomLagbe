import { pool } from '../config/db.js';

export const AmenityModel = {
  findAll: async () => {
    const { rows } = await pool.query(`SELECT * FROM AMENITY`);
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

  addRoomAmenity: async (roomId, amenityId) => {
    const query = `
      INSERT INTO ROOM_AMENITY (room_id, amenity_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING;
    `;
    await pool.query(query, [roomId, amenityId]);
  }
};