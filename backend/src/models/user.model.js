import { pool } from '../config/db.js';

export const UserModel = {
  findById: async (id) => {
    const result = await pool.query('SELECT * FROM "user" WHERE user_id = $1', [id]);
    return result.rows[0];
  },

  findByUsername: async (username) => {
    const result = await pool.query('SELECT * FROM "user" WHERE username = $1', [username]);
    return result.rows[0];
  },

  findByEmail: async (email) => {
    const result = await pool.query('SELECT * FROM "user" WHERE email = $1', [email]);
    return result.rows[0];
  },

  create: async (user) => {
    const { username, password, name, email, phone, role } = user;
    const result = await pool.query(
      `INSERT INTO "user" (username, password, name, email, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [username, password, name || username, email, phone, role || 'student']
    );
    return result.rows[0];
  },

  update: async (id, updates) => {
    const { name, email, phone, verification_status } = updates;
    const result = await pool.query(
      `UPDATE "user" 
       SET name = COALESCE($2, name),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           verification_status = COALESCE($5, verification_status)
       WHERE user_id = $1
       RETURNING *`,
      [id, name, email, phone, verification_status]
    );
    return result.rows[0];
  }
};