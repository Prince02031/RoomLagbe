import { pool } from '../config/db.js';

export const BookingModel = {
  create: async (data) => {
    const query = `
      INSERT INTO BOOKING (listing_id, student_id, booking_date, status)
      VALUES ($1, $2, $3, 'Pending')
      RETURNING *;
    `;
    const values = [data.listing_id, data.student_id, data.booking_date];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  updateStatus: async (bookingId, status) => {
    const query = `
      UPDATE BOOKING SET status = $1 WHERE booking_id = $2 RETURNING *;
    `;
    const { rows } = await pool.query(query, [status, bookingId]);
    return rows[0];
  },

  findByStudent: async (studentId) => {
    const { rows } = await pool.query(`SELECT * FROM BOOKING WHERE student_id = $1`, [studentId]);
    return rows;
  },

  findByOwner: async (ownerId) => {
    // Join through Listing -> Apartment -> Owner
    const query = `
      SELECT b.*, l.listing_type 
      FROM BOOKING b
      JOIN LISTING l ON b.listing_id = l.listing_id
      JOIN APARTMENT a ON l.apartment_id = a.apartment_id
      WHERE a.owner_id = $1
    `;
    const { rows } = await pool.query(query, [ownerId]);
    return rows;
  }
};