import { pool } from '../config/db.js';

export const ListingPhotoModel = {
  create: async (listingId, photoUrl, isThumbnail = false) => {
    const { rows } = await pool.query(
      `INSERT INTO listing_photo (listing_id, photo_url, is_thumbnail)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [listingId, photoUrl, isThumbnail]
    );
    return rows[0];
  },
  
  findByListing: async (listingId) => {
    const { rows } = await pool.query(
      `SELECT * FROM listing_photo WHERE listing_id = $1 ORDER BY is_thumbnail DESC, created_at ASC`,
      [listingId]
    );
    return rows;
  },
  
  remove: async (photoId) => {
    await pool.query(
      `DELETE FROM listing_photo WHERE photo_id = $1`,
      [photoId]
    );
  }
};

export const ListingPhotoModel = {
  add: async (listingId, photoUrl, isThumbnail = false) => {
    const query = `
      INSERT INTO listing_photos (listing_id, photo_url, is_thumbnail)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [listingId, photoUrl, isThumbnail]);
    return rows[0];
  },

  getByListing: async (listingId) => {
    const { rows } = await pool.query(`SELECT * FROM listing_photos WHERE listing_id = $1`, [listingId]);
    return rows;
  }
};