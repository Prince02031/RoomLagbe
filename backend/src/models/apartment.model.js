import { pool } from '../config/db.js';

export const ApartmentModel = {
  // Helper: Find or create location from lat/lng
  findOrCreateLocation: async (latitude, longitude, area_name = null) => {
    // Check if location exists within 50 meters (to avoid duplicates)
    const existingQuery = `
      SELECT location_id, area_name 
      FROM location 
      WHERE ST_DWithin(
        geog,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        50
      )
      LIMIT 1;
    `;
    const { rows: existing } = await pool.query(existingQuery, [longitude, latitude]);
    
    if (existing.length > 0) {
      return existing[0];
    }

    // Create new location
    const insertQuery = `
      INSERT INTO location (area_name, latitude, longitude)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const generatedAreaName = area_name || `Location ${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    const { rows } = await pool.query(insertQuery, [generatedAreaName, latitude, longitude]);
    return rows[0];
  },

  create: async (data) => {
    let locationId = data.location_id;

    // If lat/lng provided instead of location_id, auto-create location
    if (!locationId && data.latitude && data.longitude) {
      const location = await ApartmentModel.findOrCreateLocation(
        data.latitude, 
        data.longitude, 
        data.area_name
      );
      locationId = location.location_id;
    }

    if (!locationId) {
      throw new Error('Either location_id or latitude/longitude must be provided');
    }

    const query = `
      INSERT INTO apartment (owner_id, location_id, title, description, price_total, price_per_person, 
                            max_occupancy, apartment_type, women_only, available_from)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const values = [
      data.owner_id, locationId, data.title || data.name, data.description,
      data.price_total || data.total_rent, data.price_per_person, 
      data.max_occupancy, data.apartment_type || data.type, data.women_only, data.available_from
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  findByOwner: async (ownerId) => {
    const { rows } = await pool.query(
      `SELECT a.*, l.area_name, l.latitude, l.longitude 
       FROM apartment a
       JOIN location l ON a.location_id = l.location_id
       WHERE a.owner_id = $1 
       ORDER BY a.created_at DESC`, 
      [ownerId]
    );
    return rows;
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      `SELECT a.*, l.area_name, l.latitude, l.longitude 
       FROM apartment a
       JOIN location l ON a.location_id = l.location_id
       WHERE a.apartment_id = $1`, 
      [id]
    );
    return rows[0];
  },

  findByLocation: async (locationId) => {
    const { rows } = await pool.query(
      `SELECT a.*, l.area_name, l.latitude, l.longitude 
       FROM apartment a
       JOIN location l ON a.location_id = l.location_id
       WHERE a.location_id = $1`, 
      [locationId]
    );
    return rows;
  },

  findPending: async () => {
    const { rows } = await pool.query(
      `SELECT a.*, l.area_name, l.latitude, l.longitude, u.name as owner_name, u.email as owner_email
       FROM apartment a
       JOIN location l ON a.location_id = l.location_id
       JOIN "user" u ON a.owner_id = u.user_id
       WHERE a.verification_status = 'pending'
       ORDER BY a.created_at DESC`
    );
    return rows;
  },

  updateVerificationStatus: async (id, status) => {
    const { rows } = await pool.query(
      `UPDATE apartment 
       SET verification_status = $2
       WHERE apartment_id = $1
       RETURNING *`,
      [id, status]
    );
    return rows[0];
  },

  update: async (id, data) => {
    const { title, description, price_total, price_per_person, max_occupancy, 
            apartment_type, women_only, available_from } = data;
    const { rows } = await pool.query(
      `UPDATE apartment 
       SET title = COALESCE($2, title),
           description = COALESCE($3, description),
           price_total = COALESCE($4, price_total),
           price_per_person = COALESCE($5, price_per_person),
           max_occupancy = COALESCE($6, max_occupancy),
           apartment_type = COALESCE($7, apartment_type),
           women_only = COALESCE($8, women_only),
           available_from = COALESCE($9, available_from)
       WHERE apartment_id = $1
       RETURNING *`,
      [id, title, description, price_total, price_per_person, max_occupancy, 
       apartment_type, women_only, available_from]
    );
    return rows[0];
  }
};