import db from '../config/db.js';

export const UserModel = {
  findById: async (id) => {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  findByUsername: async (username) => {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
  },

  create: async (user) => {
    const { username, password, role } = user;
    const result = await db.query(
      'SELECT * FROM create_user($1, $2, $3)',
      [username, password, role]
    );
    return result.rows[0];
  }
};