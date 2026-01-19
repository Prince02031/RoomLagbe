// Mock data structures for RoomLagbe application







// Mock Universities
export const mockUniversities = [
  { id: '1', name: 'University of Dhaka', latitude: 23.7372, longitude: 90.3925 },
  { id: '2', name: 'BUET', latitude: 23.7265, longitude: 90.3933 },
  { id: '3', name: 'North South University', latitude: 23.8118, longitude: 90.4053 },
  { id: '4', name: 'BRAC University', latitude: 23.7809, longitude: 90.4064 },
];

// Mock Locations
export const mockLocations = [
  { id: '1', name: 'Mohammadpur', latitude: 23.7653, longitude: 90.3584 },
  { id: '2', name: 'Dhanmondi', latitude: 23.7463, longitude: 90.3768 },
  { id: '3', name: 'Mirpur', latitude: 23.8223, longitude: 90.3654 },
  { id: '4', name: 'Uttara', latitude: 23.8751, longitude: 90.3956 },
  { id: '5', name: 'Bashundhara', latitude: 23.8223, longitude: 90.4252 },
  { id: '6', name: 'Gulshan', latitude: 23.7933, longitude: 90.4167 },
];

// Mock Amenities
export const mockAmenities = [
  { id: '1', name: 'WiFi', category: 'basic' },
  { id: '2', name: 'AC', category: 'luxury' },
  { id: '3', name: 'Gas', category: 'basic' },
  { id: '4', name: 'Generator', category: 'luxury' },
  { id: '5', name: 'Security Guard', category: 'safety' },
  { id: '6', name: 'CCTV', category: 'safety' },
  { id: '7', name: 'Parking', category: 'basic' },
  { id: '8', name: 'Lift', category: 'luxury' },
];

// Mock Apartments
export const mockApartments = [
  {
    id: 'apt1',
    ownerId: 'owner1',
    ownerName: 'Kamal Ahmed',
    locationId: '1',
    location: 'Mohammadpur',
    totalRent: 18000,
    pricePerPerson: 6000,
    maxOccupancy: 3,
    apartmentType: '3BHK',
    womenOnly: false,
    availabilityDate: '2026-02-01',
    status: 'available',
    description: 'Spacious 3BHK apartment near market and university.',
    photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
    amenities: ['WiFi', 'Gas', 'Parking', 'CCTV'],
    fairRentScore: 8.5,
  },
  {
    id: 'apt2',
    ownerId: 'owner2',
    ownerName: 'Rina Begum',
    locationId: '2',
    location: 'Dhanmondi',
    totalRent: 24000,
    pricePerPerson: 8000,
    maxOccupancy: 3,
    apartmentType: '3BHK',
    womenOnly: true,
    availabilityDate: '2026-01-15',
    status: 'available',
    description: 'Women only apartment with modern amenities.',
    photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
    amenities: ['WiFi', 'AC', 'Gas', 'Lift', 'Security Guard'],
    fairRentScore: 7.2,
  },
  {
    id: 'apt3',
    ownerId: 'owner1',
    ownerName: 'Kamal Ahmed',
    locationId: '3',
    location: 'Mirpur',
    totalRent: 15000,
    pricePerPerson: 5000,
    maxOccupancy: 3,
    apartmentType: '2BHK',
    womenOnly: false,
    availabilityDate: '2026-02-10',
    status: 'available',
    description: 'Affordable 2BHK apartment in Mirpur area.',
    photos: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
    amenities: ['WiFi', 'Gas', 'CCTV'],
    fairRentScore: 9.1,
  },
  {
    id: 'apt4',
    ownerId: 'owner3',
    ownerName: 'Jamal Hossain',
    locationId: '4',
    location: 'Uttara',
    totalRent: 30000,
    pricePerPerson: 10000,
    maxOccupancy: 3,
    apartmentType: '4BHK',
    womenOnly: false,
    availabilityDate: '2026-01-20',
    status: 'available',
    description: 'Luxury apartment with all modern facilities.',
    photos: ['https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800'],
    amenities: ['WiFi', 'AC', 'Gas', 'Generator', 'Lift', 'Security Guard', 'Parking'],
    fairRentScore: 6.8,
  },
  {
    id: 'apt5',
    ownerId: 'owner2',
    ownerName: 'Rina Begum',
    locationId: '5',
    location: 'Bashundhara',
    totalRent: 27000,
    pricePerPerson: 9000,
    maxOccupancy: 3,
    apartmentType: '3BHK',
    womenOnly: true,
    availabilityDate: '2026-02-05',
    status: 'available',
    description: 'Premium women only apartment in Bashundhara R/A.',
    photos: ['https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800'],
    amenities: ['WiFi', 'AC', 'Gas', 'Lift', 'Security Guard', 'Parking', 'CCTV'],
    fairRentScore: 7.5,
  },
];

// Mock Room Share Listings
export const mockRoomShareListings = [
  {
    id: 'rs1',
    studentId: 'student1',
    studentName: 'Fahim Rahman',
    apartmentId: 'apt1',
    apartment: '3BHK in Mohammadpur',
    roomId: 'room1',
    location: 'Mohammadpur',
    pricePerPerson: 5500,
    womenOnly: false,
    availableFrom: '2026-01-15',
    status: 'available',
    description: 'Looking for a roommate to share a spacious room.',
    photos: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800'],
  },
  {
    id: 'rs2',
    studentId: 'student2',
    studentName: 'Nadia Islam',
    apartmentId: 'apt2',
    apartment: '3BHK in Dhanmondi',
    roomId: null,
    location: 'Dhanmondi',
    pricePerPerson: 7500,
    womenOnly: true,
    availableFrom: '2026-02-01',
    status: 'available',
    description: 'Female student looking for roommate. Women only building.',
    photos: ['https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800'],
  },
  {
    id: 'rs3',
    studentId: 'student3',
    studentName: 'Rafi Ahmed',
    apartmentId: 'apt3',
    apartment: '2BHK in Mirpur',
    roomId: 'room3',
    location: 'Mirpur',
    pricePerPerson: 4800,
    womenOnly: false,
    availableFrom: '2026-01-25',
    status: 'available',
    description: 'Student friendly, near university. Quiet environment.',
    photos: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'],
  },
];

// Current logged-in user (mock)
export const mockCurrentUser = {
  id: 'user1',
  name: 'Test Student',
  email: 'student@example.com',
  phone: '+8801234567890',
  role: 'student',
  verified: true,
};

// Analytics data
export const mockAnalyticsData = {
  areaRentStats: [
    { area: 'Mohammadpur', avgRent: 6500, minRent: 5000, maxRent: 8000 },
    { area: 'Dhanmondi', avgRent: 8500, minRent: 7500, maxRent: 10000 },
    { area: 'Mirpur', avgRent: 5500, minRent: 4500, maxRent: 7000 },
    { area: 'Uttara', avgRent: 9500, minRent: 8000, maxRent: 12000 },
    { area: 'Bashundhara', avgRent: 9000, minRent: 8000, maxRent: 11000 },
    { area: 'Gulshan', avgRent: 11000, minRent: 9000, maxRent: 15000 },
  ],
  topWishlisted: [
    { listingId: 'apt2', name: 'Dhanmondi Women Apartment', count: 45 },
    { listingId: 'apt5', name: 'Bashundhara Premium', count: 38 },
    { listingId: 'apt1', name: 'Mohammadpur 3BHK', count: 32 },
  ],
  weeklyActiveUsers: 156,
  totalListings: 85,
  totalUsers: 342,
};

// Export definitions to satisfy imports in components
export class Apartment {}
export class RoomShareListing {}
