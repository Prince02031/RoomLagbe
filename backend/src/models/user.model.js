import { pool } from '../config/db.js';

export const UserModel = {
  create: async (data) => {
    const query = `
      CALL sp_register_user($1, $2, $3, $4, $5, $6);
    `;
    // Assuming sp_register_user returns the new user or we fetch it after
    // For 'CALL', it might not return rows directly depending on driver version, but let's assume it returns the created record or we select it.
    const values = [data.name, data.email, data.phone, data.password, data.role, null]; // null for optional verification/photo
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  findByEmail: async (email) => {
    const { rows } = await pool.query(
      `SELECT * FROM "USER" WHERE email=$1`, [email]
    );
    return rows[0];
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      `SELECT * FROM "USER" WHERE user_id=$1`, [id]
    );
    return rows[0];
  }
};