import { pool } from '../config/db.js';

export const ApartmentMetricsModel = {
  /**
   * Creates or updates a metric for a given apartment.
   * This uses an ON CONFLICT clause to perform an "upsert".
   * @param {object} metricsData - The data to store, e.g., { apartment_id, fair_rent_score }.
   * @returns {Promise<object>} The created or updated metrics row.
   */
  createOrUpdate: async (metricsData) => {
    const { apartment_id, fair_rent_score } = metricsData;
    const query = `
      INSERT INTO APARTMENT_METRICS (apartment_id, fair_rent_score)
      VALUES ($1, $2)
      ON CONFLICT (apartment_id) 
      DO UPDATE SET fair_rent_score = EXCLUDED.fair_rent_score
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [apartment_id, fair_rent_score]);
    return rows[0];
  }
};
