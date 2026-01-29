-- =====================================================
-- RoomLagbe Complete Database Schema
-- PostgreSQL + PostGIS (Supabase Compatible)
-- =====================================================

-- ============= 0) EXTENSIONS =============
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- For gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS postgis;    -- For geography/location features

-- ============= 1) ENUM TYPES =============

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'owner', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE listing_type AS ENUM ('apartment', 'room_share');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE listing_status AS ENUM ('available', 'unavailable', 'booked', 'filled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============= 2) CORE TABLES =============

-- 2.1 USER (with authentication fields)
CREATE TABLE IF NOT EXISTS "user" (
  user_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username             VARCHAR(100) NOT NULL UNIQUE,
  password             VARCHAR(255) NOT NULL,
  name                 VARCHAR(100) NOT NULL,
  email                VARCHAR(150) NOT NULL UNIQUE,
  phone                VARCHAR(20) UNIQUE,
  role                 user_role NOT NULL,
  verification_status  verification_status NOT NULL DEFAULT 'unverified',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_updated_at ON "user";
CREATE TRIGGER trg_user_updated_at
BEFORE UPDATE ON "user"
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 2.2 LOCATION (area/neighborhood)
CREATE TABLE IF NOT EXISTS location (
  location_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_name     VARCHAR(200) NOT NULL,
  latitude      NUMERIC(10,7) NOT NULL,
  longitude     NUMERIC(10,7) NOT NULL,
  geog          GEOGRAPHY(POINT, 4326)
);

-- Auto-populate geography from lat/lng
CREATE OR REPLACE FUNCTION location_set_geog()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geog := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_location_set_geog ON location;
CREATE TRIGGER trg_location_set_geog
BEFORE INSERT OR UPDATE OF latitude, longitude ON location
FOR EACH ROW
EXECUTE FUNCTION location_set_geog();

-- 2.3 UNIVERSITY
CREATE TABLE IF NOT EXISTS university (
  university_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(200) NOT NULL,
  latitude      NUMERIC(10,7) NOT NULL,
  longitude     NUMERIC(10,7) NOT NULL,
  geog          GEOGRAPHY(POINT, 4326)
);

CREATE OR REPLACE FUNCTION university_set_geog()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geog := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_university_set_geog ON university;
CREATE TRIGGER trg_university_set_geog
BEFORE INSERT OR UPDATE OF latitude, longitude ON university
FOR EACH ROW
EXECUTE FUNCTION university_set_geog();

-- 2.4 APARTMENT
CREATE TABLE IF NOT EXISTS apartment (
  apartment_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id          UUID NOT NULL REFERENCES "user"(user_id) ON DELETE RESTRICT,
  location_id       UUID NOT NULL REFERENCES location(location_id) ON DELETE RESTRICT,

  title             VARCHAR(255) NOT NULL,
  description       TEXT,

  price_total       NUMERIC(12,2),
  price_per_person  NUMERIC(12,2),
  women_only        BOOLEAN NOT NULL DEFAULT FALSE,

  apartment_type    VARCHAR(20),      -- '1BHK', '2BHK', '3BHK', '4BHK'
  max_occupancy     INT,
  available_from    DATE,
  
  verification_status  verification_status NOT NULL DEFAULT 'pending',
  creator_role         user_role NOT NULL DEFAULT 'owner',

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_apartment_price_nonneg
    CHECK ((price_total IS NULL OR price_total >= 0) AND (price_per_person IS NULL OR price_per_person >= 0))
);

DROP TRIGGER IF EXISTS trg_apartment_updated_at ON apartment;
CREATE TRIGGER trg_apartment_updated_at
BEFORE UPDATE ON apartment
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 2.5 ROOM
CREATE TABLE IF NOT EXISTS room (
  room_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  std_id           UUID REFERENCES "user"(user_id) ON DELETE SET NULL,
  apartment_id     UUID NOT NULL REFERENCES apartment(apartment_id) ON DELETE CASCADE,

  room_name        VARCHAR(100) NOT NULL,
  price_per_person NUMERIC(12,2),
  capacity         INT,
  women_only       BOOLEAN NOT NULL DEFAULT FALSE,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_room_price_nonneg CHECK (price_per_person IS NULL OR price_per_person >= 0),
  CONSTRAINT chk_room_capacity_pos CHECK (capacity IS NULL OR capacity > 0)
);

DROP TRIGGER IF EXISTS trg_room_updated_at ON room;
CREATE TRIGGER trg_room_updated_at
BEFORE UPDATE ON room
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 2.6 LISTING
CREATE TABLE IF NOT EXISTS listing (
  listing_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  apartment_id       UUID REFERENCES apartment(apartment_id) ON DELETE CASCADE,
  room_id            UUID REFERENCES room(room_id) ON DELETE CASCADE,

  listing_type       listing_type NOT NULL,
  price_per_person   NUMERIC(12,2) NOT NULL,
  availability_status listing_status NOT NULL DEFAULT 'available',
  women_only         BOOLEAN NOT NULL DEFAULT FALSE,
  
  verification_status  verification_status NOT NULL DEFAULT 'pending',

  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_listing_price_nonneg CHECK (price_per_person >= 0),
  CONSTRAINT chk_listing_target
    CHECK (
      (listing_type = 'apartment'  AND apartment_id IS NOT NULL AND room_id IS NULL)
      OR
      (listing_type = 'room_share' AND room_id IS NOT NULL AND apartment_id IS NULL)
    )
);

DROP TRIGGER IF EXISTS trg_listing_updated_at ON listing;
CREATE TRIGGER trg_listing_updated_at
BEFORE UPDATE ON listing
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 2.7 LISTING_PHOTO
CREATE TABLE IF NOT EXISTS listing_photo (
  photo_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    UUID NOT NULL REFERENCES listing(listing_id) ON DELETE CASCADE,
  photo_url     TEXT NOT NULL,
  is_thumbnail  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure only one thumbnail per listing
CREATE UNIQUE INDEX IF NOT EXISTS ux_listing_one_thumbnail
ON listing_photo(listing_id)
WHERE is_thumbnail = TRUE;

-- ============= 3) AMENITIES (Many-to-Many) =============

CREATE TABLE IF NOT EXISTS amenity (
  amenity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS room_amenity (
  room_id     UUID NOT NULL REFERENCES room(room_id) ON DELETE CASCADE,
  amenity_id  UUID NOT NULL REFERENCES amenity(amenity_id) ON DELETE RESTRICT,
  PRIMARY KEY (room_id, amenity_id)
);

CREATE TABLE IF NOT EXISTS apartment_amenity (
  apartment_id UUID NOT NULL REFERENCES apartment(apartment_id) ON DELETE CASCADE,
  amenity_id   UUID NOT NULL REFERENCES amenity(amenity_id) ON DELETE RESTRICT,
  PRIMARY KEY (apartment_id, amenity_id)
);

-- ============= 4) BOOKING =============

CREATE TABLE IF NOT EXISTS booking (
  booking_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id   UUID NOT NULL REFERENCES listing(listing_id) ON DELETE CASCADE,
  std_id       UUID NOT NULL REFERENCES "user"(user_id) ON DELETE RESTRICT,

  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  visit_time   TIMESTAMPTZ,
  status       booking_status NOT NULL DEFAULT 'pending',

  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_booking_dates CHECK (start_date <= end_date)
);

DROP TRIGGER IF EXISTS trg_booking_updated_at ON booking;
CREATE TRIGGER trg_booking_updated_at
BEFORE UPDATE ON booking
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- ============= 5) COMMUTE =============

CREATE TABLE IF NOT EXISTS commute_time (
  commute_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES "user"(user_id) ON DELETE SET NULL,
  listing_id     UUID NOT NULL REFERENCES listing(listing_id) ON DELETE CASCADE,
  university_id  UUID NOT NULL REFERENCES university(university_id) ON DELETE CASCADE,

  walking_time   INT,              -- minutes
  bus_time       INT,              -- minutes (optional)
  distance_km    NUMERIC(6,2),
  calculated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_commute_nonneg CHECK (
    (walking_time IS NULL OR walking_time >= 0) AND
    (bus_time IS NULL OR bus_time >= 0) AND
    (distance_km IS NULL OR distance_km >= 0)
  )
);

-- Prevent duplicates per listing+university combination
CREATE UNIQUE INDEX IF NOT EXISTS ux_commute_unique
ON commute_time(listing_id, university_id, COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- ============= 6) WISHLIST =============

CREATE TABLE IF NOT EXISTS wishlist (
  user_id     UUID NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  listing_id  UUID NOT NULL REFERENCES listing(listing_id) ON DELETE CASCADE,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, listing_id)
);

-- ============= 7) SAVED_SEARCH =============

CREATE TABLE IF NOT EXISTS saved_search (
  saved_search_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  name            TEXT,                  -- User-friendly name for the search
  criteria        JSONB NOT NULL,        -- Store search filters as JSON
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============= 8) APARTMENT_METRICS (Fair Rent Scores) =============

CREATE TABLE IF NOT EXISTS apartment_metrics (
  apartment_id      UUID PRIMARY KEY REFERENCES apartment(apartment_id) ON DELETE CASCADE,
  fair_rent_score   NUMERIC(5,2),     -- Score from 0-100
  view_count        INT DEFAULT 0,
  wishlist_count    INT DEFAULT 0,
  last_calculated   TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT chk_fair_rent_score CHECK (fair_rent_score IS NULL OR (fair_rent_score >= 0 AND fair_rent_score <= 100))
);

-- ============= 9) INDEXES =============

-- User lookups
CREATE INDEX IF NOT EXISTS idx_user_username ON "user"(username);
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_user_role ON "user"(role);

-- Listing filters
CREATE INDEX IF NOT EXISTS idx_listing_type ON listing(listing_type);
CREATE INDEX IF NOT EXISTS idx_listing_status ON listing(availability_status);
CREATE INDEX IF NOT EXISTS idx_listing_women_only ON listing(women_only);
CREATE INDEX IF NOT EXISTS idx_listing_price ON listing(price_per_person);

-- Foreign keys / joins
CREATE INDEX IF NOT EXISTS idx_apartment_owner ON apartment(owner_id);
CREATE INDEX IF NOT EXISTS idx_apartment_location ON apartment(location_id);
CREATE INDEX IF NOT EXISTS idx_room_apartment ON room(apartment_id);
CREATE INDEX IF NOT EXISTS idx_room_student ON room(std_id);
CREATE INDEX IF NOT EXISTS idx_listing_apartment ON listing(apartment_id);
CREATE INDEX IF NOT EXISTS idx_listing_room ON listing(room_id);
CREATE INDEX IF NOT EXISTS idx_photo_listing ON listing_photo(listing_id);
CREATE INDEX IF NOT EXISTS idx_booking_listing ON booking(listing_id);
CREATE INDEX IF NOT EXISTS idx_booking_student ON booking(std_id);
CREATE INDEX IF NOT EXISTS idx_commute_listing ON commute_time(listing_id);
CREATE INDEX IF NOT EXISTS idx_commute_university ON commute_time(university_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_search_user ON saved_search(user_id);

-- PostGIS spatial indexes
CREATE INDEX IF NOT EXISTS idx_location_geog ON location USING GIST (geog);
CREATE INDEX IF NOT EXISTS idx_university_geog ON university USING GIST (geog);

-- ============= 10) HELPER FUNCTIONS =============

-- Function to get listings near a location
CREATE OR REPLACE FUNCTION get_listings_near_location(
  search_lat NUMERIC,
  search_lng NUMERIC,
  radius_meters INT DEFAULT 5000
)
RETURNS TABLE (
  listing_id UUID,
  distance_meters NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.listing_id,
    ST_Distance(
      loc.geog,
      ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography
    )::NUMERIC as distance_meters
  FROM listing l
  JOIN apartment apt ON l.apartment_id = apt.apartment_id
  JOIN location loc ON apt.location_id = loc.location_id
  WHERE ST_DWithin(
    loc.geog,
    ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography,
    radius_meters
  )
  ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate distance between listing and university
CREATE OR REPLACE FUNCTION calculate_listing_university_distance(
  p_listing_id UUID,
  p_university_id UUID
)
RETURNS NUMERIC AS $$
DECLARE
  distance_km NUMERIC;
BEGIN
  SELECT 
    ST_Distance(loc.geog, uni.geog) / 1000.0
  INTO distance_km
  FROM listing l
  JOIN apartment apt ON l.apartment_id = apt.apartment_id
  JOIN location loc ON apt.location_id = loc.location_id
  CROSS JOIN university uni
  WHERE l.listing_id = p_listing_id
    AND uni.university_id = p_university_id;
  
  RETURN distance_km;
END;
$$ LANGUAGE plpgsql;

-- ============= COMPLETED =============
-- Schema created successfully with all tables, indexes, and functions
