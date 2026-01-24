import { pool } from '../config/db.js';

export const BookingModel = {
  create: async (data) => {
    const query = `
      INSERT INTO booking (listing_id, std_id, start_date, end_date, status)
      VALUES ($1, $2, $3, $4, 'pending')
      RETURNING *;
    `;
    const values = [
      data.listing_id, 
      data.std_id || data.student_id, 
      data.start_date || data.booking_date, 
      data.end_date || data.booking_date
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  updateStatus: async (bookingId, status) => {
    const query = `
      UPDATE booking SET status = $1 WHERE booking_id = $2 RETURNING *;
    `;
    const { rows } = await pool.query(query, [status, bookingId]);
    return rows[0];
  },

  findByStudent: async (studentId) => {
    const query = `
      SELECT b.*, 
             l.listing_type, l.price_per_person,
             a.title as apartment_title,
             r.room_name,
             loc.area_name as location
      FROM booking b
      JOIN listing l ON b.listing_id = l.listing_id
      LEFT JOIN apartment a ON l.apartment_id = a.apartment_id
      LEFT JOIN room r ON l.room_id = r.room_id
      LEFT JOIN location loc ON a.location_id = loc.location_id
      WHERE b.std_id = $1
      ORDER BY b.created_at DESC
    `;
    const { rows } = await pool.query(query, [studentId]);
    return rows;
  },

  findByOwner: async (ownerId) => {
    const query = `
      SELECT b.*, 
             l.listing_type, l.price_per_person,
             a.title as apartment_title,
             r.room_name,
             u.name as student_name, u.email as student_email, u.phone as student_phone
      FROM booking b
      JOIN listing l ON b.listing_id = l.listing_id
      LEFT JOIN apartment a ON l.apartment_id = a.apartment_id
      LEFT JOIN room r ON l.room_id = r.room_id
      JOIN "user" u ON b.std_id = u.user_id
      WHERE a.owner_id = $1
      ORDER BY b.created_at DESC
    `;
    const { rows } = await pool.query(query, [ownerId]);
    return rows;
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      'SELECT * FROM booking WHERE booking_id = $1', [id]
    );
    return rows[0];
  },

  rejectAllPendingForListing: async (listingId, exceptBookingId) => {
    const query = `
      UPDATE booking 
      SET status = 'rejected' 
      WHERE listing_id = $1 
      AND status = 'pending' 
      AND booking_id != $2;
    `;
    await pool.query(query, [listingId, exceptBookingId]);
  }
};