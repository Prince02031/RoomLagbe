import { pool } from '../config/db.js';

export const CommuteModel = {
  upsert: async (listingId, universityId, distanceKm, walkingTime, userId = null) => {
    const query = `
      INSERT INTO commute_time (listing_id, university_id, distance_km, walking_time, user_id)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (listing_id, university_id, COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid))
      DO UPDATE SET distance_km = EXCLUDED.distance_km, walking_time = EXCLUDED.walking_time, calculated_at = now()
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [listingId, universityId, distanceKm, walkingTime, userId]);
    return rows[0];
  },

  get: async (listingId, universityId, userId = null) => {
    const query = `
      SELECT * FROM commute_time 
      WHERE listing_id = $1 AND university_id = $2 
      AND (user_id = $3 OR user_id IS NULL)
      ORDER BY calculated_at DESC
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [listingId, universityId, userId]);
    return rows[0];
  }
};