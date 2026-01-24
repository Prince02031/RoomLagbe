-- =====================================================
-- Migration: Add creator_role to apartment table
-- Tracks whether apartment was created by owner or student
-- Safe to run multiple times (idempotent)
-- =====================================================

-- Add creator_role to apartment table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'apartment' AND column_name = 'creator_role'
  ) THEN
    ALTER TABLE apartment 
    ADD COLUMN creator_role user_role NOT NULL DEFAULT 'owner';
    
    RAISE NOTICE 'Added creator_role column to apartment table';
  ELSE
    RAISE NOTICE 'creator_role column already exists in apartment table';
  END IF;
END $$;

SELECT 'Migration completed successfully!' as status;
