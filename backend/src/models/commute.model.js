import { pool } from '../config/db.js';

export const CommuteModel = {
  upsert: async (listingId, universityId, distanceKm, timeMins) => {
    const query = `
      INSERT INTO COMMUTE (listing_id, university_id, distance_km, time_mins)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (listing_id, university_id) 
      DO UPDATE SET distance_km = EXCLUDED.distance_km, time_mins = EXCLUDED.time_mins
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [listingId, universityId, distanceKm, timeMins]);
    return rows[0];
  },

  get: async (listingId, universityId) => {
    const query = `SELECT * FROM COMMUTE WHERE listing_id = $1 AND university_id = $2`;
    const { rows } = await pool.query(query, [listingId, universityId]);
    return rows[0];
  }
};