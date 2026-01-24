import { pool } from '../config/db.js';

export const WishlistModel = {
  add: async (userId, listingId) => {
    const query = `
      INSERT INTO wishlist (user_id, listing_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, listing_id) DO NOTHING
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [userId, listingId]);
    return rows[0];
  },

  remove: async (userId, listingId) => {
    await pool.query(
      `DELETE FROM wishlist WHERE user_id = $1 AND listing_id = $2`, 
      [userId, listingId]
    );
  },

  getByUser: async (userId) => {
    const query = `
      SELECT w.*, 
             l.listing_type, l.price_per_person, l.availability_status,
             a.title as apartment_title, a.apartment_type,
             r.room_name,
             loc.area_name as location,
             lp.photo_url as thumbnail
      FROM wishlist w
      JOIN listing l ON w.listing_id = l.listing_id
      LEFT JOIN apartment a ON l.apartment_id = a.apartment_id
      LEFT JOIN room r ON l.room_id = r.room_id
      LEFT JOIN location loc ON a.location_id = loc.location_id
      LEFT JOIN listing_photo lp ON l.listing_id = lp.listing_id AND lp.is_thumbnail = true
      WHERE w.user_id = $1
      ORDER BY w.added_at DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  },

  getTopWishlisted: async (limit = 10) => {
    const query = `
      SELECT l.listing_id, 
             COUNT(w.user_id) as wishlist_count,
             l.listing_type,
             a.title,
             loc.area_name as location
      FROM listing l
      JOIN wishlist w ON l.listing_id = w.listing_id
      LEFT JOIN apartment a ON l.apartment_id = a.apartment_id
      LEFT JOIN location loc ON a.location_id = loc.location_id
      GROUP BY l.listing_id, l.listing_type, a.title, loc.area_name
      ORDER BY wishlist_count DESC 
      LIMIT $1
    `;
    const { rows } = await pool.query(query, [limit]);
    return rows;
  }
};