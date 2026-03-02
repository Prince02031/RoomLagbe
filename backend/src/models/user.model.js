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
    const {
      name,
      email,
      phone,
      verification_status,
      student_id,
      university,
      student_proof,
      nid,
      contact,
      ownership_proof
    } = updates;

    const result = await pool.query(
      `UPDATE "user"
       SET name = COALESCE($2, name),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           verification_status = COALESCE($5, verification_status),
           student_id = COALESCE($6, student_id),
           university = COALESCE($7, university),
           student_proof = COALESCE($8, student_proof),
           nid = COALESCE($9, nid),
           contact = COALESCE($10, contact),
           ownership_proof = COALESCE($11, ownership_proof)
       WHERE user_id = $1
       RETURNING *`,
      [id, name, email, phone, verification_status, student_id, university, student_proof, nid, contact, ownership_proof]
    );
    return result.rows[0];
  },

  // Find users by verification status, optionally filtered by role
  findByVerificationStatus: async (status, role) => {
    let query = 'SELECT * FROM "user" WHERE verification_status = $1';
    const params = [status];
    if (role) {
      query += ' AND role = $2';
      params.push(role);
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    return result.rows;
  },

  // Update only the verification status of a user
  updateVerificationStatus: async (userId, status) => {
    const result = await pool.query(
      `UPDATE "user"
       SET verification_status = $2
       WHERE user_id = $1
       RETURNING *`,
      [userId, status]
    );
    return result.rows[0];
  }
};