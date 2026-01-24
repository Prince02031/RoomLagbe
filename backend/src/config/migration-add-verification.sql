-- =====================================================
-- Migration: Add verification_status to apartments and listings
-- Safe to run multiple times (idempotent)
-- =====================================================

-- Add verification_status to apartment table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'apartment' AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE apartment 
    ADD COLUMN verification_status verification_status NOT NULL DEFAULT 'pending';
    
    RAISE NOTICE 'Added verification_status column to apartment table';
  ELSE
    RAISE NOTICE 'verification_status column already exists in apartment table';
  END IF;
END $$;

-- Add verification_status to listing table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listing' AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE listing 
    ADD COLUMN verification_status verification_status NOT NULL DEFAULT 'pending';
    
    RAISE NOTICE 'Added verification_status column to listing table';
  ELSE
    RAISE NOTICE 'verification_status column already exists in listing table';
  END IF;
END $$;

-- Optional: Update existing records to 'verified' if you want them available immediately
-- Uncomment if needed:
UPDATE apartment SET verification_status = 'verified' WHERE verification_status = 'pending';
UPDATE listing SET verification_status = 'verified' WHERE verification_status = 'pending';

SELECT 'Migration completed successfully!' as status;
