import { ListingModel } from '../models/listing.model.js';
import { ListingPhotoModel } from '../models/listingPhoto.model.js';

export const ListingController = {
  create: async (req, res, next) => {
    try {
      // Ensure the apartment belongs to the owner (validation logic omitted for brevity)
      const listing = await ListingModel.create(req.body);
      res.status(201).json(listing);
    } catch (err) {
      next(err);
    }
  },

  getAll: async (req, res, next) => {
    try {
      // req.query contains filters like minPrice, maxPrice, area, etc.
      const listings = await ListingModel.search(req.query);
      res.json(listings);
    } catch (err) {
      next(err);
    }
  },

  getById: async (req, res, next) => {
    try {
      const listing = await ListingModel.findById(req.params.id);
      if (!listing) return res.status(404).json({ message: 'Listing not found' });
      const photos = await ListingPhotoModel.getByListing(req.params.id);
      res.json({ ...listing, photos });
    } catch (err) {
      next(err);
    }
  },

  addPhotos: async (req, res, next) => {
    try {
      const { photoUrl, isThumbnail } = req.body;
      const photo = await ListingPhotoModel.add(req.params.id, photoUrl, isThumbnail);
      res.status(201).json(photo);
    } catch (err) {
      next(err);
    }
  }
};