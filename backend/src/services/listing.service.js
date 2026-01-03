import { ListingModel } from '../models/listing.model.js';

export const ListingService = {
  createListing: async (payload) => {
    // extra validation or rules can go here
    return await ListingModel.create(payload);
  },

  getAllListings: async () => {
    return await ListingModel.findAll();
  }
};