-- Migration: Add visit_time field to booking table for visit requests
-- This allows students to schedule visit times and enables 2-hour time blocking

-- Add visit_time column to store the scheduled visit date and time
ALTER TABLE booking 
ADD COLUMN IF NOT EXISTS visit_time TIMESTAMPTZ;

-- Add index on visit_time for efficient time conflict queries
CREATE INDEX IF NOT EXISTS idx_booking_visit_time ON booking(visit_time);

-- Add index on listing_id and visit_time for time blocking queries
CREATE INDEX IF NOT EXISTS idx_booking_listing_visit ON booking(listing_id, visit_time);

-- Add index on listing_id and status for filtering approved visits
CREATE INDEX IF NOT EXISTS idx_booking_listing_status ON booking(listing_id, status);

-- Update booking status enum if it doesn't have all required values
-- Note: This assumes the enum already exists from initial schema
DO $$ BEGIN
  -- Check if we need to add any status values
  -- This is safe to run even if values already exist
  ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'cancelled';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Add comment for documentation
COMMENT ON COLUMN booking.visit_time IS 'Scheduled visit date and time. When approved, creates a 2-hour time block where no other visits can be scheduled for the same listing.';
