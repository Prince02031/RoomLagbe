import { pool } from '../config/db.js';

export const ListingModel = {
  create: async (data) => {
    const query = `
      CALL sp_create_listing($1, $2, $3, $4, $5, $6);
    `;
    const values = [
      data.apartment_id,
      data.room_id,
      data.listing_type,
      data.price_per_person,
      data.women_only
    ];
    // Note: availability_status is usually default 'Available' on creation
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  findAll: async () => {
    const { rows } = await pool.query(`SELECT * FROM LISTING`);
    return rows;
  },

  findById: async (id) => {
    const { rows } = await pool.query(`SELECT * FROM LISTING WHERE listing_id = $1`, [id]);
    return rows[0];
  },

  search: async (filters) => {
    let query = `
      SELECT l.*, 
             loc.area_name, 
             loc.latitude, 
             loc.longitude,
             a.fair_rent_score
      FROM LISTING l
      JOIN APARTMENT apt ON l.apartment_id = apt.apartment_id
      JOIN LOCATION loc ON apt.location_id = loc.location_id
      LEFT JOIN (
        SELECT apartment_id, AVG(fair_rent_score) as fair_rent_score 
        FROM APARTMENT_METRICS GROUP BY apartment_id
      ) a ON l.apartment_id = a.apartment_id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (filters.minPrice) {
      query += ` AND l.price_per_person >= $${paramIndex++}`;
      values.push(filters.minPrice);
    }
    if (filters.maxPrice) {
      query += ` AND l.price_per_person <= $${paramIndex++}`;
      values.push(filters.maxPrice);
    }
    if (filters.listingType) {
      query += ` AND l.listing_type = $${paramIndex++}`;
      values.push(filters.listingType);
    }
    if (filters.womenOnly !== undefined) {
      query += ` AND l.women_only = $${paramIndex++}`;
      values.push(filters.womenOnly);
    }
    if (filters.area) {
      query += ` AND loc.area_name ILIKE $${paramIndex++}`;
      values.push(`%${filters.area}%`);
    }

    // Radius Search (Haversine Formula) - No PostGIS
    if (filters.lat && filters.lng && filters.radius) {
      const earthRadius = 6371; // km
      query += ` AND (
        ${earthRadius} * acos(
          cos(radians($${paramIndex++})) * cos(radians(loc.latitude)) * cos(radians(loc.longitude) - radians($${paramIndex++})) +
          sin(radians($${paramIndex-2})) * sin(radians(loc.latitude))
        )
      ) <= $${paramIndex++}`;
      values.push(filters.lat, filters.lng, filters.radius);
    }

    const { rows } = await pool.query(query, values);
    return rows;
  }
};