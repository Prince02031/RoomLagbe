import { CommuteModel } from '../models/commute.model.js';
import { ListingModel } from '../models/listing.model.js';
// import axios from 'axios'; // Assuming axios is available for external API calls

export const CommuteController = {
  calculate: async (req, res, next) => {
    try {
      const { listingId, universityId } = req.query;
      
      // Check if already cached in DB
      const cached = await CommuteModel.get(listingId, universityId);
      if (cached) return res.json(cached);

      // If not, calculate (Mocking external API logic here)
      // In production: Fetch lat/long of listing and university, call OSRM/Google Maps API
      
      // Mock calculation for demonstration
      const distanceKm = (Math.random() * 5 + 1).toFixed(2); // Random 1-6km
      const walkingSpeedKmH = 5;
      const timeMins = Math.round((distanceKm / walkingSpeedKmH) * 60);

      const result = await CommuteModel.upsert(
        listingId, 
        universityId, 
        distanceKm, 
        timeMins
      );

      res.json(result);
    } catch (err) {
      next(err);
    }
  }
};