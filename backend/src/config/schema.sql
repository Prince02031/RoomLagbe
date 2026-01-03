-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'Student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Function: Automatically update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Trigger: Attach the function to the 'users' table
DROP TRIGGER IF EXISTS update_user_modtime ON users;
CREATE TRIGGER update_user_modtime
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- 4. Stored Function: Create User (Used by user.model.js)
CREATE OR REPLACE FUNCTION create_user(
    _username VARCHAR,
    _password VARCHAR,
    _role VARCHAR
)
RETURNS SETOF users AS $$
BEGIN
    RETURN QUERY
    INSERT INTO users (username, password, role)
    VALUES (_username, _password, _role)
    RETURNING *;
END;
$$ LANGUAGE plpgsql;

-- 5. Create Listings Table
CREATE TABLE IF NOT EXISTS listings (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  address TEXT,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Trigger: Attach the function to the 'listings' table
DROP TRIGGER IF EXISTS update_listing_modtime ON listings;
CREATE TRIGGER update_listing_modtime
    BEFORE UPDATE ON listings
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- 7. Create Listing Photos Table
CREATE TABLE IF NOT EXISTS listing_photos (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  is_thumbnail BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);