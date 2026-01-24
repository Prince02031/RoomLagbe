-- =====================================================
-- Seed Locations for RoomLagbe
-- Specific areas near IUT Boardbazar (walking distance)
-- Gazipur, Boardbazar region
-- =====================================================

-- Delete existing locations (if re-seeding)
-- DELETE FROM location;

-- Boardbazar and IUT Immediate Area (Walking Distance)
INSERT INTO location (area_name, latitude, longitude) VALUES
  ('IUT Main Gate', 23.9897, 90.4246),
  ('Boardbazar Main Road', 23.9915, 90.4235),
  ('Kalmeshwar', 23.9880, 90.4220),
  ('Begum Rokeya Road', 23.9905, 90.4230),
  ('Hoichoi Goli', 23.9892, 90.4240),
  ('Road Opposite (West Side)', 23.9885, 90.4210),
  ('Boardbazar Market', 23.9910, 90.4225),
  ('North Para', 23.9925, 90.4245),
  ('South Para', 23.9870, 90.4230),
  ('East Boardbazar', 23.9900, 90.4260),
  ('Kumargaon Entrance', 23.9865, 90.4195),
  ('Pubail Road', 23.9850, 90.4180),
  ('Boro Masjid Area', 23.9895, 90.4235),
  ('Chandna Chourasta', 23.9950, 90.4290),
  ('Housing Area', 23.9920, 90.4215),
  ('Market Back Alley', 23.9908, 90.4218),
  ('Station Road Side', 23.9888, 90.4228),
  ('Char Rasta', 23.9912, 90.4242),
  ('College Road', 23.9875, 90.4205),
  ('Tin Shed Area', 23.9902, 90.4252);

-- Display inserted locations
SELECT area_name, latitude, longitude, location_id 
FROM location 
ORDER BY area_name;
