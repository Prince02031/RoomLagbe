# RoomLagbe Database Documentation

## 📊 ER Diagram Generation Tools

### Recommended Tools (Free & Online)

#### 1. **dbdiagram.io** ⭐ HIGHLY RECOMMENDED
**URL:** https://dbdiagram.io/

**Features:**
- Simple DSL syntax for defining tables
- Auto-generates ER diagrams
- Supports PostgreSQL syntax
- Export to PNG, PDF, SQL
- Free for public diagrams
- Clean, professional output

**How to Use:**
1. Go to dbdiagram.io
2. Create new diagram
3. Paste your schema (can convert from SQL)
4. Auto-generates visual ER diagram
5. Export as image

**Pros:**
- ✅ Fast and easy
- ✅ Professional output
- ✅ Supports relationships
- ✅ Export to multiple formats

#### 2. **DBeaver** (Desktop Tool)
**URL:** https://dbeaver.io/

**Features:**
- Connect directly to your Supabase database
- Auto-generates ER diagrams from live DB
- View all relationships visually
- Free and open-source

**How to Use:**
1. Install DBeaver
2. Connect to Supabase PostgreSQL
3. Right-click database → ER Diagram
4. Export as image

**Pros:**
- ✅ Works with live database
- ✅ Shows actual data relationships
- ✅ Free forever

#### 3. **QuickDBD** (Quick Database Diagrams)
**URL:** https://www.quickdatabasediagrams.com/

**Features:**
- Text-to-diagram conversion
- Export to PNG, PDF, SQL
- Simple syntax

**Pros:**
- ✅ Very fast
- ✅ Simple to use

#### 4. **DrawSQL** (Alternative)
**URL:** https://drawsql.app/

**Features:**
- Visual drag-and-drop
- Import from SQL
- Export diagrams
- Team collaboration

**Pros:**
- ✅ Visual editor
- ✅ SQL import

#### 5. **Supabase Studio** (Built-in)
**URL:** Your Supabase Dashboard → Table Editor → Schema Visualizer

**Features:**
- Already have access
- Shows relationships
- Built-in to Supabase

**How to Use:**
1. Go to Supabase Dashboard
2. Table Editor
3. Schema Visualizer (if available)

---

## 🔧 Database Triggers

### 1. `trg_user_updated_at`
**Table:** `user`  
**Type:** BEFORE UPDATE  
**Function:** `update_modified_column()`

**Description:**  
Automatically updates the `updated_at` timestamp whenever a user record is modified. Ensures audit trail of user profile changes.

**Trigger Logic:**
```sql
BEFORE UPDATE ON "user"
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
```

**Use Case:** Track when users update their profile, email, or phone.

---

### 2. `trg_location_set_geog`
**Table:** `location`  
**Type:** BEFORE INSERT OR UPDATE  
**Function:** `location_set_geog()`

**Description:**  
Automatically converts latitude/longitude coordinates into PostGIS geography points. This enables spatial queries like finding listings within X meters of a location.

**Trigger Logic:**
```sql
BEFORE INSERT OR UPDATE OF latitude, longitude ON location
FOR EACH ROW
EXECUTE FUNCTION location_set_geog();
```

**PostGIS Conversion:**
```sql
NEW.geog := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
```

**Use Case:**  
- Auto-create location with lat/lng from OpenStreetMap
- Enable radius-based search (e.g., "find apartments within 2km")
- Calculate distances between listings and universities

---

### 3. `trg_university_set_geog`
**Table:** `university`  
**Type:** BEFORE INSERT OR UPDATE  
**Function:** `university_set_geog()`

**Description:**  
Same as location trigger - converts university coordinates into PostGIS geography points for spatial calculations.

**Trigger Logic:**
```sql
BEFORE INSERT OR UPDATE OF latitude, longitude ON university
FOR EACH ROW
EXECUTE FUNCTION university_set_geog();
```

**Use Case:**  
- Calculate commute distance from apartment to university
- Enable "near university" search filters

---

### 4. `trg_apartment_updated_at`
**Table:** `apartment`  
**Type:** BEFORE UPDATE  
**Function:** `update_modified_column()`

**Description:**  
Tracks when apartment details are modified (price, description, amenities, etc.)

**Use Case:** Audit trail for apartment changes by owners.

---

### 5. `trg_room_updated_at`
**Table:** `room`  
**Type:** BEFORE UPDATE  
**Function:** `update_modified_column()`

**Description:**  
Tracks when room details are modified (price, capacity, etc.)

**Use Case:** Audit trail for room changes by students.

---

### 6. `trg_listing_updated_at`
**Table:** `listing`  
**Type:** BEFORE UPDATE  
**Function:** `update_modified_column()`

**Description:**  
Tracks when listings are modified (status, price, availability)

**Use Case:**  
- Track when listing status changes (available → booked → filled)
- Audit trail for admin verification

---

### 7. `trg_booking_updated_at`
**Table:** `booking`  
**Type:** BEFORE UPDATE  
**Function:** `update_modified_column()`

**Description:**  
Tracks when booking status changes (pending → approved/rejected)

**Use Case:**  
- Track when owner approves/rejects visit request
- Audit trail for booking workflow

---

## 🛠️ Database Functions (Procedures)

### 1. `update_modified_column()`
**Type:** Trigger Function  
**Returns:** TRIGGER  
**Language:** PL/pgSQL

**Description:**  
Universal function used by all `updated_at` triggers. Sets the `updated_at` column to current timestamp.

**Code:**
```sql
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Used By:** user, apartment, room, listing, booking tables

---

### 2. `location_set_geog()`
**Type:** Trigger Function  
**Returns:** TRIGGER  
**Language:** PL/pgSQL

**Description:**  
Converts latitude/longitude to PostGIS geography point. Uses SRID 4326 (WGS 84 - World Geodetic System).

**Code:**
```sql
CREATE OR REPLACE FUNCTION location_set_geog()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geog := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**PostGIS Functions Used:**
- `ST_MakePoint(lng, lat)` - Creates point from coordinates
- `ST_SetSRID(geom, 4326)` - Sets spatial reference system
- `::geography` - Casts to geography type for accurate distance calculations

**Used By:** location table

---

### 3. `university_set_geog()`
**Type:** Trigger Function  
**Returns:** TRIGGER  
**Language:** PL/pgSQL

**Description:**  
Identical to `location_set_geog()` but for university table. Converts university coordinates to geography points.

**Code:**
```sql
CREATE OR REPLACE FUNCTION university_set_geog()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geog := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Used By:** university table

---

### 4. `get_listings_near_location()`
**Type:** Query Function  
**Returns:** TABLE (listing_id UUID, distance_meters NUMERIC)  
**Language:** PL/pgSQL

**Description:**  
Finds all listings within a specified radius of a given lat/lng coordinate. Returns listings sorted by distance (nearest first).

**Parameters:**
- `search_lat` NUMERIC - Latitude to search from
- `search_lng` NUMERIC - Longitude to search from
- `radius_meters` INT - Search radius (default: 5000m = 5km)

**Code:**
```sql
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
```

**PostGIS Functions Used:**
- `ST_Distance(geog1, geog2)` - Calculates distance in meters
- `ST_DWithin(geog1, geog2, distance)` - Filters by distance threshold

**Use Cases:**
- "Find apartments within 2km of IUT"
- "Show listings near my current location"
- Map-based radius search

**Example Usage:**
```sql
-- Find listings within 1km of IUT
SELECT * FROM get_listings_near_location(23.9897, 90.4233, 1000);
```

---

### 5. `calculate_listing_university_distance()`
**Type:** Scalar Function  
**Returns:** NUMERIC (distance in kilometers)  
**Language:** PL/pgSQL

**Description:**  
Calculates the straight-line distance (as the crow flies) between a listing and a university.

**Parameters:**
- `p_listing_id` UUID - Listing to calculate from
- `p_university_id` UUID - University to calculate to

**Code:**
```sql
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
```

**Use Cases:**
- Display "2.5 km from IUT" on listing details
- Sort listings by distance to user's university
- Calculate commute times

**Example Usage:**
```sql
-- Get distance between listing and IUT
SELECT calculate_listing_university_distance(
  'listing-uuid-here',
  'iut-uuid-here'
);
-- Returns: 2.35 (km)
```

---

## 📋 Summary Statistics

### Triggers: 7 Total
- ✅ 5 `updated_at` triggers (user, apartment, room, listing, booking)
- ✅ 2 `geog` triggers (location, university)

### Functions: 5 Total
- ✅ 3 Trigger functions (update_modified_column, location_set_geog, university_set_geog)
- ✅ 2 Query functions (get_listings_near_location, calculate_listing_university_distance)

### PostGIS Spatial Features
- ✅ Geography columns on location and university tables
- ✅ Automatic coordinate conversion
- ✅ Spatial indexes (GIST) for performance
- ✅ Distance calculations in meters/kilometers
- ✅ Radius-based search support

---

## 🎯 Database Constraints Summary

### Check Constraints (Data Validation)
1. **Price Non-Negative:** `apartment.price_total >= 0`, `apartment.price_per_person >= 0`
2. **Room Price Non-Negative:** `room.price_per_person >= 0`
3. **Room Capacity Positive:** `room.capacity > 0`
4. **Listing Price Non-Negative:** `listing.price_per_person >= 0`
5. **Booking Dates Valid:** `booking.start_date <= end_date`
6. **Commute Times Non-Negative:** `commute_time.walking_time >= 0`, etc.
7. **Fair Rent Score Range:** `apartment_metrics.fair_rent_score` between 0-100
8. **Listing Target Validation:** Ensures apartment listings link to apartments, room_share listings link to rooms

### Unique Constraints
1. **User Username Unique:** No duplicate usernames
2. **User Email Unique:** No duplicate emails
3. **User Phone Unique:** No duplicate phone numbers
4. **Amenity Name Unique:** No duplicate amenity names
5. **One Thumbnail Per Listing:** Only one photo can be marked as thumbnail
6. **Unique Commute Calculations:** One distance calculation per listing-university pair

### Foreign Key Constraints
- All relationships properly defined with `ON DELETE CASCADE` or `ON DELETE RESTRICT`
- Owner deletion restricted if they have apartments
- Student deletion restricted if they have bookings
- Apartment deletion cascades to rooms and listings
- Listing deletion cascades to bookings and photos

---

## 🔍 Indexes Summary

### Standard Indexes (21 Total)
- User lookups: username, email, role
- Listing filters: type, status, women_only, price
- Foreign key indexes: All junction tables indexed
- Performance indexes: All frequently queried columns

### Spatial Indexes (2 PostGIS GIST)
- `location.geog` - Enables fast proximity searches
- `university.geog` - Enables fast distance calculations

**Index Types:**
- B-Tree (default): Standard columns
- GIST: Spatial/geography columns
- Unique: Username, email, phone

---

## � Functions vs Procedures in PostgreSQL

### Why RoomLagbe Uses Only Functions (Not Procedures)

**Current Implementation:** 5 Functions, 0 Procedures ✅

### Core Differences

| Feature | FUNCTION | PROCEDURE |
|---------|----------|-----------|
| **Return Value** | MUST return something | Optional (can be void) |
| **Call Method** | `SELECT function()` or in SQL | `CALL procedure()` |
| **Use in Queries** | ✅ Can use in SELECT/WHERE | ❌ Cannot use in queries |
| **Transaction Control** | ❌ No COMMIT/ROLLBACK | ✅ Can COMMIT/ROLLBACK |
| **Use in Triggers** | ✅ Yes | ❌ No |
| **Created With** | `CREATE FUNCTION` | `CREATE PROCEDURE` |
| **PostgreSQL Version** | All versions | Version 11+ (2018) |

### When to Use Each

#### ✅ Use FUNCTIONS when:
- Returning data (values, tables, rows)
- Computing calculations
- Used in triggers (REQUIRED)
- Need to use in SELECT/WHERE clauses
- Most common use case

#### ✅ Use PROCEDURES when:
- Complex business logic with multiple steps
- Need transaction control (COMMIT/ROLLBACK)
- Batch operations
- Data migrations
- No return value needed

### RoomLagbe Architecture Decision

**Functions are sufficient because:**

1. ✅ **Business logic lives in Node.js backend** (services/controllers)
2. ✅ **Functions handle all database needs**:
   - Trigger functions for data integrity (auto-update timestamps, coordinates)
   - Query functions for calculations (distance, proximity search)
3. ✅ **Node.js handles transaction control** via `pool.query()`
4. ✅ **No complex multi-step DB operations** requiring autonomous transactions

**Functions Used:**
- `update_modified_column()` - Automatic timestamp updates (triggers)
- `location_set_geog()` - PostGIS coordinate conversion (triggers)
- `university_set_geog()` - PostGIS coordinate conversion (triggers)
- `get_listings_near_location()` - Proximity search (query function)
- `calculate_listing_university_distance()` - Distance calculation (query function)

**Why No Procedures Needed:**
- ❌ No batch processing (e.g., monthly rent calculations)
- ❌ No multi-step data migrations
- ❌ No database-level business rules enforcement
- ❌ Application handles all complex workflows

### Example Comparison

**FUNCTION (Current Implementation):**
```sql
-- Can be used in queries
CREATE FUNCTION calculate_listing_university_distance(
  p_listing_id UUID,
  p_university_id UUID
)
RETURNS NUMERIC AS $$
BEGIN
  RETURN (SELECT ST_Distance(loc.geog, uni.geog) / 1000.0 ...);
END;
$$ LANGUAGE plpgsql;

-- Usage in SELECT statement
SELECT listing_id, 
       calculate_listing_university_distance(listing_id, 'uni-uuid') as distance
FROM listing;
```

**PROCEDURE (Not Used):**
```sql
-- Cannot be used in queries, only called directly
CREATE PROCEDURE process_monthly_rent_payments()
LANGUAGE plpgsql AS $$
BEGIN
  -- Step 1: Update bookings
  UPDATE booking SET status = 'active' WHERE ...;
  COMMIT; -- Explicit transaction control
  
  -- Step 2: Generate invoices
  INSERT INTO invoices ...;
  COMMIT;
  
  -- Step 3: Send notifications
  PERFORM send_notifications();
  COMMIT;
END;
$$;

-- Usage with CALL
CALL process_monthly_rent_payments();
```

### Architecture Pattern

**✅ Standard Modern Architecture (Recommended):**
- **Database:** Data integrity, constraints, indexes, simple calculations
- **Functions:** Triggers, PostGIS operations, query optimizations
- **Application (Node.js):** Business logic, workflows, API orchestration
- **Frontend (React):** User interface, state management

This separation of concerns keeps the database focused on data management while complex logic remains testable and maintainable in application code.

---
## 💼 Business Logic Examples in RoomLagbe

### Real-World Business Rules Handled by Node.js Backend

#### 1. Visit Request Time Conflict Validation
**Location:** `booking.service.js`

```javascript
// 2-hour time blocking system
createBooking: async (bookingData) => {
  // Check listing availability
  const listing = await ListingModel.findById(bookingData.listing_id);
  if (listing.availability_status !== 'available') {
    throw new Error('Listing is no longer available');
  }

  // Check time conflicts (2-hour blocking window)
  if (bookingData.visit_time) {
    const conflict = await BookingModel.checkTimeConflict(
      bookingData.listing_id, 
      bookingData.visit_time
    );
    if (conflict) {
      throw new Error('Time slot already booked');
    }
  }

  return await BookingModel.create(bookingData);
}
```

**Why in Node.js:** Custom error messages, logging, easy testing, flexible rules.

---

#### 2. Role-Based Listing Type Enforcement
**Location:** `listing.controller.js`

```javascript
// Owners can only post apartments, students can only post room-shares
create: async (req, res) => {
  const { listing_type } = req.body;
  const userRole = req.user.role;

  if (userRole === 'owner' && listing_type !== 'apartment') {
    return res.status(403).json({
      message: 'Owners can only create apartment listings'
    });
  }

  if (userRole === 'student' && listing_type !== 'room_share') {
    return res.status(403).json({
      message: 'Students can only create room_share listings'
    });
  }
  // Continue with creation...
}
```

**Why in Node.js:** Integrated with JWT auth, proper HTTP status codes, easy to modify rules.

---

#### 3. Authorization Checks
**Location:** `booking.service.js`

```javascript
// Only listing owner can approve/reject bookings
updateBookingStatus: async (bookingId, status, userId) => {
  const booking = await BookingModel.findById(bookingId);
  const listing = await ListingModel.findById(booking.listing_id);
  
  // Authorization check
  if (listing.creator_id !== userId) {
    throw new Error('Not authorized to update this booking');
  }
  
  return await BookingModel.updateStatus(bookingId, status);
}
```

**Why in Node.js:** Works with JWT tokens, multi-step verification, proper error handling.

---

#### 4. Multi-Step Listing Creation
**Location:** `listing.controller.js`

```javascript
// Auto-creates apartment → room → listing → amenities in sequence
create: async (req, res) => {
  // Step 1: Create apartment if needed
  if (!apartment_id) {
    const apartment = await ApartmentModel.create({...});
    apartment_id = apartment.apartment_id;
  }

  // Step 2: Create room for room-share listings
  if (listing_type === 'room_share') {
    const room = await RoomModel.create({apartment_id, ...});
    room_id = room.room_id;
  }

  // Step 3: Create listing
  const listing = await ListingModel.create({...});

  // Step 4: Associate amenities
  for (const amenityId of req.body.amenities) {
    await AmenityModel.addApartmentAmenity(apartment_id, amenityId);
  }
}
```

**Why in Node.js:** Complex conditional logic, multiple tables, flexible workflow.

---

#### 5. Auto-Location Creation with Proximity Check
**Location:** `apartment.model.js`

```javascript
// Prevents duplicate locations within 50 meters
findOrCreateLocation: async (latitude, longitude, area_name) => {
  // Check if location exists within 50m radius
  const existing = await pool.query(`
    SELECT location_id FROM location 
    WHERE ST_DWithin(geog, ST_MakePoint($1, $2)::geography, 50)
  `, [longitude, latitude]);
  
  if (existing.rows.length > 0) {
    return existing.rows[0]; // Use existing
  }

  // Create new location
  return await pool.query(`
    INSERT INTO location (area_name, latitude, longitude)
    VALUES ($1, $2, $3) RETURNING *
  `, [area_name, latitude, longitude]);
}
```

**Why in Node.js:** Business rule (50m threshold), auto-naming, flexible logic.

---

#### 6. Async Fair Rent Calculation
**Location:** `listing.service.js`

```javascript
// Non-blocking background calculation
createListing: async (listingData, userId) => {
  const listing = await ListingModel.create(listingData);

  // Trigger async calculation (doesn't block response)
  FairRentService.calculateAndStoreFairRentScore(listing.apartment_id)
    .catch(err => console.error('Fair rent calc error:', err));

  return listing; // Return immediately
}
```

**Why in Node.js:** Non-blocking, can add to job queue, error doesn't fail creation.

---

### Transaction Management

**Current Approach:** Implicit transactions (each `pool.query()` is atomic).

**When Explicit Transactions Are Needed:**

```javascript
// Example: Atomic apartment + room + listing creation
const client = await pool.connect();
try {
  await client.query('BEGIN');
  
  const apartment = await client.query('INSERT INTO apartment...');
  const room = await client.query('INSERT INTO room...');
  const listing = await client.query('INSERT INTO listing...');
  
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

**Why RoomLagbe Doesn't Need This:**
- Single-insert operations (database constraints ensure integrity)
- CASCADE handles related deletions
- No financial transactions requiring atomicity
- Error recovery handled by frontend (user can retry)

---
## �💡 Recommended ER Diagram Tool for Your Project

**Use dbdiagram.io** because:
1. ✅ Free and online (no installation)
2. ✅ Export to PNG for documentation
3. ✅ Simple syntax conversion from your SQL
4. ✅ Professional output for academic presentations
5. ✅ Can share link with team/professors

**Alternative:** Use DBeaver to connect to your live Supabase database and export actual ER diagram.

---

## 📚 Additional Documentation Files

You should also create:
1. **API_ENDPOINTS.md** - List all REST endpoints
2. **TESTING_GUIDE.md** - Postman test scenarios
3. **DEPLOYMENT_GUIDE.md** - How to deploy backend/frontend
4. **USER_MANUAL.md** - How to use the app
5. **DATABASE_BACKUP.md** - Backup/restore procedures
