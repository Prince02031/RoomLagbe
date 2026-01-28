import { pool } from '../config/db.js';

export const BookingModel = {
  create: async (data) => {
    const query = `
      INSERT INTO booking (listing_id, std_id, start_date, end_date, status, visit_time)
      VALUES ($1, $2, $3, $4, 'pending', $5)
      RETURNING *;
    `;
    const values = [
      data.listing_id, 
      data.std_id || data.student_id, 
      data.start_date || data.booking_date, 
      data.end_date || data.booking_date,
      data.visit_time
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
             COALESCE(loc.area_name, loc2.area_name) as location,
             COALESCE(u_owner.name, u_room_owner.name) as owner_name, 
             COALESCE(u_owner.email, u_room_owner.email) as owner_email, 
             COALESCE(u_owner.phone, u_room_owner.phone) as owner_phone
      FROM booking b
      JOIN listing l ON b.listing_id = l.listing_id
      LEFT JOIN apartment a ON l.apartment_id = a.apartment_id
      LEFT JOIN room r ON l.room_id = r.room_id
      LEFT JOIN location loc ON a.location_id = loc.location_id
      LEFT JOIN apartment a2 ON r.apartment_id = a2.apartment_id
      LEFT JOIN location loc2 ON a2.location_id = loc2.location_id
      LEFT JOIN "user" u_owner ON a.owner_id = u_owner.user_id
      LEFT JOIN "user" u_room_owner ON r.std_id = u_room_owner.user_id
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
      WHERE a.owner_id = $1 OR r.std_id = $1
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
  },

  // Check for time conflicts with approved visits (2-hour window)
  checkTimeConflict: async (listingId, visitTime, excludeBookingId = null) => {
    // Check if the new visit time falls within 2 hours after any existing approved visit
    const query = `
      SELECT b.*, 
             u.name as student_name, u.email as student_email
      FROM booking b
      JOIN "user" u ON b.std_id = u.user_id
      WHERE b.listing_id = $1 
      AND b.status = 'approved' 
      AND b.visit_time IS NOT NULL
      ${excludeBookingId ? 'AND b.booking_id != $3' : ''}
      AND (
        -- New visit time is within 2 hours after an existing approved visit
        ($2 >= b.visit_time AND $2 < (b.visit_time + INTERVAL '2 hours'))
        OR
        -- New visit time would block an existing approved visit (new visit + 2 hours overlaps)
        (b.visit_time >= $2 AND b.visit_time < ($2::timestamptz + INTERVAL '2 hours'))
      )
      LIMIT 1;
    `;
    const values = excludeBookingId 
      ? [listingId, visitTime, excludeBookingId]
      : [listingId, visitTime];
    
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  },

  // Get approved visits for a listing on a specific date
  getApprovedVisitsForDate: async (listingId, date) => {
    const query = `
      SELECT visit_time, 
             u.name as student_name
      FROM booking b
      JOIN "user" u ON b.std_id = u.user_id
      WHERE b.listing_id = $1 
      AND b.status = 'approved' 
      AND b.visit_time IS NOT NULL
      AND DATE(b.visit_time) = $2
      ORDER BY b.visit_time;
    `;
    const { rows } = await pool.query(query, [listingId, date]);
    return rows;
  }
};