import express from 'express';
import listingRoutes from './routes/listing.routes.js';
import authRoutes from './routes/auth.routes.js';

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);

export default app;