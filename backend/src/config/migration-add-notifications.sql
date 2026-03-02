-- Migration: Add notification table for in-app notifications

CREATE TABLE IF NOT EXISTS notification (
  notification_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  type VARCHAR(60) NOT NULL,
  title VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_user_created
  ON notification(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_user_unread
  ON notification(user_id, is_read);
