import { pool } from '../config/db.js';

export const ListingModel = {
  // Find all listings with optional filters
  findAll: async (filters = {}) => {
    let query = `
      SELECT l.*, 
             COALESCE(a.title, ra.title) as apartment_title, 
             r.room_name,
             COALESCE(loc.area_name, rloc.area_name) as location,
             COALESCE(a.available_from, ra.available_from) as available_from,
             COALESCE(a.apartment_type, ra.apartment_type) as apartment_type,
             COALESCE(a.max_occupancy, ra.max_occupancy) as max_occupancy,
             COALESCE(u_owner.name, u_student.name) as owner_name,
             COALESCE(u_owner.phone, u_student.phone) as owner_phone,
             COALESCE(u_owner.email, u_student.email) as owner_email
      FROM listing l
      LEFT JOIN apartment a ON l.apartment_id = a.apartment_id
      LEFT JOIN room r ON l.room_id = r.room_id
      LEFT JOIN apartment ra ON r.apartment_id = ra.apartment_id
      LEFT JOIN location loc ON a.location_id = loc.location_id
      LEFT JOIN location rloc ON ra.location_id = rloc.location_id
      LEFT JOIN "user" u_owner ON (a.owner_id = u_owner.user_id)
      LEFT JOIN "user" u_student ON (r.std_id = u_student.user_id)
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.listing_type) {
      query += ` AND l.listing_type = $${paramCount++}`;
      values.push(filters.listing_type);
    }

    // Handle women_only: could be boolean or string 'true'/'false'
    if (filters.women_only !== undefined && filters.women_only !== 'false') {
      const isWomenOnly = filters.women_only === true || filters.women_only === 'true';
      if (isWomenOnly) {
        query += ` AND l.women_only = $${paramCount++}`;
        values.push(true);
      }
    }

    if (filters.availability_status) {
      query += ` AND l.availability_status = $${paramCount++}`;
      values.push(filters.availability_status);
    }

    if (filters.min_price) {
      query += ` AND l.price_per_person >= $${paramCount++}`;
      values.push(filters.min_price);
    }

    if (filters.max_price) {
      query += ` AND l.price_per_person <= $${paramCount++}`;
      values.push(filters.max_price);
    }

    if (filters.location_id) {
      query += ` AND (a.location_id = $${paramCount} OR ra.location_id = $${paramCount})`;
      paramCount++;
      values.push(filters.location_id);
    }

    query += ` ORDER BY l.created_at DESC`;

    const result = await pool.query(query, values);
    return result.rows;
  },

  findById: async (id) => {
    const query = `
      SELECT l.*, 
             COALESCE(a.title, ra.title) as title, 
             COALESCE(a.description, ra.description) as apartment_description,
             COALESCE(a.apartment_type, ra.apartment_type) as apartment_type, 
             COALESCE(a.max_occupancy, ra.max_occupancy) as max_occupancy,
             COALESCE(a.available_from, ra.available_from) as available_from,
             r.room_name, r.capacity,
             COALESCE(loc.area_name, rloc.area_name) as location, 
             COALESCE(loc.latitude, rloc.latitude) as latitude, 
             COALESCE(loc.longitude, rloc.longitude) as longitude,
             COALESCE(u_owner.name, u_student.name) as owner_name, 
             COALESCE(u_owner.email, u_student.email) as owner_email, 
             COALESCE(u_owner.phone, u_student.phone) as owner_phone
      FROM listing l
      LEFT JOIN apartment a ON l.apartment_id = a.apartment_id
      LEFT JOIN room r ON l.room_id = r.room_id
      LEFT JOIN apartment ra ON r.apartment_id = ra.apartment_id
      LEFT JOIN location loc ON a.location_id = loc.location_id
      LEFT JOIN location rloc ON ra.location_id = rloc.location_id
      LEFT JOIN "user" u_owner ON (a.owner_id = u_owner.user_id)
      LEFT JOIN "user" u_student ON (r.std_id = u_student.user_id)
      WHERE l.listing_id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  create: async (data) => {
    const { apartment_id, room_id, listing_type, price_per_person, women_only } = data;
    const result = await pool.query(
      `INSERT INTO listing (apartment_id, room_id, listing_type, price_per_person, women_only)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [apartment_id, room_id, listing_type, price_per_person, women_only || false]
    );
    return result.rows[0];
  },

  update: async (id, data) => {
    const { price_per_person, availability_status, women_only } = data;
    const result = await pool.query(
      `UPDATE listing 
       SET price_per_person = COALESCE($2, price_per_person),
           availability_status = COALESCE($3, availability_status),
           women_only = COALESCE($4, women_only)
       WHERE listing_id = $1
       RETURNING *`,
      [id, price_per_person, availability_status, women_only]
    );
    return result.rows[0];
  },

  findPending: async () => {
    const query = `
      SELECT l.*, 
             COALESCE(a.title, ra.title) as apartment_title, 
             COALESCE(a.owner_id, ra.owner_id) as owner_id,
             u.name as owner_name,
             u.email as owner_email,
             r.room_name,
             COALESCE(loc.area_name, rloc.area_name) as location
      FROM listing l
      LEFT JOIN apartment a ON l.apartment_id = a.apartment_id
      LEFT JOIN room r ON l.room_id = r.room_id
      LEFT JOIN apartment ra ON r.apartment_id = ra.apartment_id
      LEFT JOIN location loc ON a.location_id = loc.location_id
      LEFT JOIN location rloc ON ra.location_id = rloc.location_id
      LEFT JOIN "user" u ON (a.owner_id = u.user_id OR ra.owner_id = u.user_id)
      WHERE l.verification_status = 'pending'
      ORDER BY l.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Find all listings for a specific user
  findByUser: async (userId) => {
    const query = `
      SELECT l.*, 
             COALESCE(a.title, ra.title) as apartment_title, 
             r.room_name,
             COALESCE(loc.area_name, rloc.area_name) as location
      FROM listing l
      LEFT JOIN apartment a ON l.apartment_id = a.apartment_id
      LEFT JOIN room r ON l.room_id = r.room_id
      LEFT JOIN apartment ra ON r.apartment_id = ra.apartment_id
      LEFT JOIN location loc ON a.location_id = loc.location_id
      LEFT JOIN location rloc ON ra.location_id = rloc.location_id
      WHERE a.owner_id = $1 OR ra.owner_id = $1 OR r.std_id = $1
      ORDER BY l.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  updateVerificationStatus: async (id, status) => {
    const result = await pool.query(
      `UPDATE listing 
       SET verification_status = $2
       WHERE listing_id = $1
       RETURNING *`,
      [id, status]
    );
    return result.rows[0];
  },

  // Search with filters (for search service)
  search: async (filters) => {
    // This is a more complex search - can be enhanced
    return await ListingModel.findAll(filters);
  }
};