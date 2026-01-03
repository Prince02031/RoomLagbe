import express from 'express';
import cors from 'cors';
import listingRoutes from './routes/listing.routes.js';
import authRoutes from './routes/auth.routes.js';
import { config } from './config/env.js';

const app = express();

// Enable CORS for frontend communication
app.use(cors({ origin: config.clientUrl || '*' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('RoomLagbe Backend is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);

export default app;