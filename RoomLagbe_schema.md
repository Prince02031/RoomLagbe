# RoomLagbe (PostgreSQL + PostGIS) — Schema (Draft)

> Based on the provided Draft ER Diagram.  
> Assumptions: UUID primary keys, PostgreSQL, and **PostGIS enabled from the beginning**.

---

## 0) Extensions

```sql
-- UUID generation (choose one)
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()

-- PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
```

---

## 1) Enum types (recommended)

```sql
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
```

---

## 2) Core tables

### 2.1 USER

```sql
CREATE TABLE IF NOT EXISTS "user" (
  user_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 VARCHAR(100) NOT NULL,
  email                VARCHAR(150) NOT NULL UNIQUE,
  phone                VARCHAR(20) UNIQUE,
  role                 user_role NOT NULL,
  verification_status  verification_status NOT NULL DEFAULT 'unverified',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### 2.2 LOCATION (area centroid / neighborhood)

```sql
CREATE TABLE IF NOT EXISTS location (
  location_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_name     VARCHAR(200) NOT NULL,
  latitude      NUMERIC(10,7) NOT NULL,
  longitude     NUMERIC(10,7) NOT NULL,

  -- PostGIS geography point (meters-based distance)
  geog          GEOGRAPHY(POINT, 4326)
);

-- Keep geog in sync (optional but recommended)
CREATE OR REPLACE FUNCTION location_set_geog()
RETURNS trigger AS $$
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
```

---

### 2.3 UNIVERSITY

```sql
CREATE TABLE IF NOT EXISTS university (
  university_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(200) NOT NULL,
  latitude      NUMERIC(10,7) NOT NULL,
  longitude     NUMERIC(10,7) NOT NULL,
  geog          GEOGRAPHY(POINT, 4326)
);

CREATE OR REPLACE FUNCTION university_set_geog()
RETURNS trigger AS $$
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
```

---

### 2.4 APARTMENT

```sql
CREATE TABLE IF NOT EXISTS apartment (
  apartment_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id          UUID NOT NULL REFERENCES "user"(user_id) ON DELETE RESTRICT,
  location_id       UUID NOT NULL REFERENCES location(location_id) ON DELETE RESTRICT,

  title             VARCHAR(255) NOT NULL,
  description       TEXT,

  price_total       NUMERIC(12,2),
  price_per_person  NUMERIC(12,2),
  women_only        BOOLEAN NOT NULL DEFAULT FALSE,

  apartment_type    VARCHAR(20),      -- keep as VARCHAR per ERD (optionally make ENUM)
  max_occupancy     INT,
  available_from    DATE,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_apartment_price_nonneg
    CHECK ((price_total IS NULL OR price_total >= 0) AND (price_per_person IS NULL OR price_per_person >= 0))
);

-- Optional: ensure only owners can own apartments (enforced by app or trigger/procedure)
```

---

### 2.5 ROOM

```sql
CREATE TABLE IF NOT EXISTS room (
  room_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  std_id          UUID REFERENCES "user"(user_id) ON DELETE SET NULL,      -- student occupant/creator (if applicable)
  apartment_id    UUID NOT NULL REFERENCES apartment(apartment_id) ON DELETE CASCADE,

  room_name       VARCHAR(100) NOT NULL,
  price_per_person NUMERIC(12,2),
  capacity        INT,
  women_only      BOOLEAN NOT NULL DEFAULT FALSE,

  CONSTRAINT chk_room_price_nonneg CHECK (price_per_person IS NULL OR price_per_person >= 0),
  CONSTRAINT chk_room_capacity_pos CHECK (capacity IS NULL OR capacity > 0)
);
```

---

### 2.6 LISTING

```sql
CREATE TABLE IF NOT EXISTS listing (
  listing_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  apartment_id       UUID REFERENCES apartment(apartment_id) ON DELETE CASCADE,
  room_id            UUID REFERENCES room(room_id) ON DELETE CASCADE,

  listing_type       listing_type NOT NULL,
  price_per_person   NUMERIC(12,2) NOT NULL,
  availability_status listing_status NOT NULL DEFAULT 'available',
  women_only         BOOLEAN NOT NULL DEFAULT FALSE,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_listing_price_nonneg CHECK (price_per_person >= 0),

  -- Only one of apartment_id / room_id should be set based on listing_type
  CONSTRAINT chk_listing_target
    CHECK (
      (listing_type = 'apartment'  AND apartment_id IS NOT NULL AND room_id IS NULL)
      OR
      (listing_type = 'room_share' AND room_id IS NOT NULL AND apartment_id IS NULL)
    )
);
```

---

### 2.7 LISTING_PHOTO

```sql
CREATE TABLE IF NOT EXISTS listing_photo (
  photo_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    UUID NOT NULL REFERENCES listing(listing_id) ON DELETE CASCADE,
  photo_url     TEXT NOT NULL,
  is_thumbnail  BOOLEAN NOT NULL DEFAULT FALSE
);

-- Optional: ensure only one thumbnail per listing
CREATE UNIQUE INDEX IF NOT EXISTS ux_listing_one_thumbnail
ON listing_photo(listing_id)
WHERE is_thumbnail = TRUE;
```

---

## 3) Amenities (many-to-many)

### 3.1 AMENITY

```sql
CREATE TABLE IF NOT EXISTS amenity (
  amenity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) NOT NULL UNIQUE
);
```

### 3.2 ROOM_AMENITY

```sql
CREATE TABLE IF NOT EXISTS room_amenity (
  room_id     UUID NOT NULL REFERENCES room(room_id) ON DELETE CASCADE,
  amenity_id  UUID NOT NULL REFERENCES amenity(amenity_id) ON DELETE RESTRICT,
  PRIMARY KEY (room_id, amenity_id)
);
```

### 3.3 APARTMENT_AMENITY

```sql
CREATE TABLE IF NOT EXISTS apartment_amenity (
  apartment_id UUID NOT NULL REFERENCES apartment(apartment_id) ON DELETE CASCADE,
  amenity_id   UUID NOT NULL REFERENCES amenity(amenity_id) ON DELETE RESTRICT,
  PRIMARY KEY (apartment_id, amenity_id)
);
```

---

## 4) Booking + commute

### 4.1 BOOKING

```sql
CREATE TABLE IF NOT EXISTS booking (
  booking_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id   UUID NOT NULL REFERENCES listing(listing_id) ON DELETE CASCADE,
  std_id       UUID NOT NULL REFERENCES "user"(user_id) ON DELETE RESTRICT, -- student who books

  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  status       booking_status NOT NULL DEFAULT 'pending',

  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_booking_dates CHECK (start_date <= end_date)
);
```

---

### 4.2 COMMUTE_TIME

```sql
CREATE TABLE IF NOT EXISTS commute_time (
  commute_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES "user"(user_id) ON DELETE SET NULL,
  listing_id     UUID NOT NULL REFERENCES listing(listing_id) ON DELETE CASCADE,
  university_id  UUID NOT NULL REFERENCES university(university_id) ON DELETE CASCADE,

  walking_time   INT,              -- minutes
  bus_time       INT,              -- minutes (optional for later)
  distance_km    NUMERIC(6,2),
  calculated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_commute_nonneg CHECK (
    (walking_time IS NULL OR walking_time >= 0) AND
    (bus_time IS NULL OR bus_time >= 0) AND
    (distance_km IS NULL OR distance_km >= 0)
  )
);

-- Optional: prevent duplicates per listing+university+user combination
CREATE UNIQUE INDEX IF NOT EXISTS ux_commute_unique
ON commute_time(listing_id, university_id, COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid));
```

---

## 5) Indexes (minimum recommended)

```sql
-- Listing filters
CREATE INDEX IF NOT EXISTS idx_listing_type         ON listing(listing_type);
CREATE INDEX IF NOT EXISTS idx_listing_status       ON listing(availability_status);
CREATE INDEX IF NOT EXISTS idx_listing_women_only   ON listing(women_only);
CREATE INDEX IF NOT EXISTS idx_listing_price        ON listing(price_per_person);

-- Foreign keys / joins
CREATE INDEX IF NOT EXISTS idx_apartment_owner      ON apartment(owner_id);
CREATE INDEX IF NOT EXISTS idx_apartment_location   ON apartment(location_id);
CREATE INDEX IF NOT EXISTS idx_room_apartment       ON room(apartment_id);
CREATE INDEX IF NOT EXISTS idx_photo_listing        ON listing_photo(listing_id);
CREATE INDEX IF NOT EXISTS idx_booking_listing      ON booking(listing_id);
CREATE INDEX IF NOT EXISTS idx_commute_listing      ON commute_time(listing_id);
CREATE INDEX IF NOT EXISTS idx_commute_university   ON commute_time(university_id);

-- PostGIS: fast radius queries
CREATE INDEX IF NOT EXISTS idx_location_geog   ON location USING GIST (geog);
CREATE INDEX IF NOT EXISTS idx_university_geog ON university USING GIST (geog);
```

---

## 6) Notes / mapping to ERD

- `room.std_id` and `booking.std_id` reference `"user"(user_id)` (student).
- `apartment.owner_id` references `"user"(user_id)` (owner).
- `listing` references exactly one target: either `apartment_id` or `room_id` (enforced by `chk_listing_target`).
- PostGIS geography is stored as `GEOGRAPHY(Point, 4326)` in `location.geog` and `university.geog` to enable meter-based distance functions like `ST_DWithin`.

---
