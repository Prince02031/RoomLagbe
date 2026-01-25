import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';

// Import all routes
import authRoutes from './routes/auth.routes.js';
import listingRoutes from './routes/listing.routes.js';
import apartmentRoutes from './routes/apartment.routes.js';
import roomRoutes from './routes/room.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import savedSearchRoutes from './routes/savedSearch.routes.js';
import amenityRoutes from './routes/amenity.routes.js';
import universityRoutes from './routes/university.routes.js';
import locationRoutes from './routes/location.routes.js';
import commuteRoutes from './routes/commute.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

// Enable CORS for frontend communication
app.use(cors({ origin: config.clientUrl || '*' }));
app.use(express.json());

// Simple request logger for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

app.get('/', (req, res) => {
  res.send('RoomLagbe Backend is running!');
});

// Mount all routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/apartments', apartmentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/saved-searches', savedSearchRoutes);
app.use('/api/amenities', amenityRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/commute', commuteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

export default app;