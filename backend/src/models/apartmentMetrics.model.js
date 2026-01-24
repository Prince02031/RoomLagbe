import { pool } from '../config/db.js';

export const ApartmentMetricsModel = {
  /**
   * Creates or updates a metric for a given apartment.
   * This uses an ON CONFLICT clause to perform an "upsert".
   * @param {object} metricsData - The data to store, e.g., { apartment_id, fair_rent_score }.
   * @returns {Promise<object>} The created or updated metrics row.
   */
  createOrUpdate: async (metricsData) => {
    const { apartment_id, fair_rent_score, view_count, wishlist_count } = metricsData;
    const query = `
      INSERT INTO apartment_metrics (apartment_id, fair_rent_score, view_count, wishlist_count)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (apartment_id) 
      DO UPDATE SET 
        fair_rent_score = COALESCE(EXCLUDED.fair_rent_score, apartment_metrics.fair_rent_score),
        view_count = COALESCE(EXCLUDED.view_count, apartment_metrics.view_count),
        wishlist_count = COALESCE(EXCLUDED.wishlist_count, apartment_metrics.wishlist_count),
        last_calculated = now()
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [apartment_id, fair_rent_score, view_count, wishlist_count]);
    return rows[0];
  },
  
  findByApartment: async (apartmentId) => {
    const { rows } = await pool.query(
      `SELECT * FROM apartment_metrics WHERE apartment_id = $1`,
      [apartmentId]
    );
    return rows[0];
  }
};
