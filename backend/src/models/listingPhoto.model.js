import { pool } from '../config/db.js';

export const ListingPhotoModel = {
  add: async (listingId, photoUrl, isThumbnail = false) => {
    const query = `
      INSERT INTO LISTING_PHOTO (listing_id, photo_url, is_thumbnail)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [listingId, photoUrl, isThumbnail]);
    return rows[0];
  },

  getByListing: async (listingId) => {
    const { rows } = await pool.query(`SELECT * FROM LISTING_PHOTO WHERE listing_id = $1`, [listingId]);
    return rows;
  }
};