import { pool } from '../config/db.js';

export const ListingModel = {
  // Find all listings with optional filters
  findAll: async (filters = {}) => {
    let query = `
      SELECT l.*, 
             a.title as apartment_title, 
             r.room_name,
             loc.area_name as location
      FROM listing l
      LEFT JOIN apartment a ON l.apartment_id = a.apartment_id
      LEFT JOIN room r ON l.room_id = r.room_id
      LEFT JOIN location loc ON a.location_id = loc.location_id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.listing_type) {
      query += ` AND l.listing_type = $${paramCount++}`;
      values.push(filters.listing_type);
    }
    if (filters.women_only !== undefined) {
      query += ` AND l.women_only = $${paramCount++}`;
      values.push(filters.women_only);
    }
    if (filters.availability_status) {
      query += ` AND l.availability_status = $${paramCount++}`;
      values.push(filters.availability_status);
    }

    query += ` ORDER BY l.created_at DESC`;
    
    const result = await pool.query(query, values);
    return result.rows;
  },

  findById: async (id) => {
    const query = `
      SELECT l.*, 
             a.title, a.description as apartment_description,
             a.apartment_type, a.max_occupancy,
             r.room_name, r.capacity,
             loc.area_name as location, loc.latitude, loc.longitude,
             u.name as owner_name, u.email as owner_email, u.phone as owner_phone
      FROM listing l
      LEFT JOIN apartment a ON l.apartment_id = a.apartment_id
      LEFT JOIN room r ON l.room_id = r.room_id
      LEFT JOIN location loc ON a.location_id = loc.location_id
      LEFT JOIN "user" u ON a.owner_id = u.user_id
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
             a.title as apartment_title, 
             a.owner_id,
             u.name as owner_name,
             u.email as owner_email,
             r.room_name,
             loc.area_name as location
      FROM listing l
      LEFT JOIN apartment a ON l.apartment_id = a.apartment_id
      LEFT JOIN room r ON l.room_id = r.room_id
      LEFT JOIN location loc ON a.location_id = loc.location_id
      LEFT JOIN "user" u ON a.owner_id = u.user_id
      WHERE l.verification_status = 'pending'
      ORDER BY l.created_at DESC
    `;
    const result = await pool.query(query);
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