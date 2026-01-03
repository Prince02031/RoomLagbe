import db from '../config/db.js';

export const ListingModel = {
  findAll: async () => {
    const result = await db.query('SELECT * FROM listings ORDER BY created_at DESC');
    return result.rows;
  },

  findById: async (id) => {
    const result = await db.query('SELECT * FROM listings WHERE id = $1', [id]);
    return result.rows[0];
  },

  create: async (data) => {
    const { title, description, price, address, ownerId } = data;
    const result = await db.query(
      'INSERT INTO listings (title, description, price, address, owner_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, price, address, ownerId]
    );
    return result.rows[0];
  },

  update: async (id, data) => {
    const { title, price } = data;
    const result = await db.query(
      'UPDATE listings SET title = $1, price = $2 WHERE id = $3 RETURNING *',
      [title, price, id]
    );
    return result.rows[0];
  }
};