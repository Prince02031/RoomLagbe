import { pool } from '../config/db.js';

export const NotificationModel = {
  create: async ({ user_id, type, title, message, meta = {} }) => {
    const query = `
      INSERT INTO notification (user_id, type, title, message, meta)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [user_id, type, title, message, JSON.stringify(meta || {})];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  findByUser: async (userId) => {
    const query = `
      SELECT *
      FROM notification
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  },

  markAsRead: async (notificationId, userId) => {
    const query = `
      UPDATE notification
      SET is_read = true
      WHERE notification_id = $1 AND user_id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [notificationId, userId]);
    return rows[0];
  },

  markAllAsRead: async (userId) => {
    const query = `
      UPDATE notification
      SET is_read = true
      WHERE user_id = $1 AND is_read = false
      RETURNING notification_id
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  },
};
