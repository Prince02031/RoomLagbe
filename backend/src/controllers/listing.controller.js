import { ListingModel } from '../models/listing.model.js';

export const ListingController = {
  // Get all listings (with optional filters)
  getAll: async (req, res) => {
    try {
      const listings = await ListingModel.findAll();
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching listings', error: error.message });
    }
  },

  // Get a single listing by ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const listing = await ListingModel.findById(id);
      
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
      res.json(listing);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching listing', error: error.message });
    }
  },

  // Create a new listing
  create: async (req, res) => {
    try {
      const listing = await ListingModel.create({
        ...req.body,
        ownerId: req.user.id
      });
      res.status(201).json(listing);
    } catch (error) {
      res.status(500).json({ message: 'Error creating listing', error: error.message });
    }
  },

  // Update a listing
  update: async (req, res) => {
    try {
      // In a real app, check if req.user.id owns this listing first
      const listing = await ListingModel.update(req.params.id, req.body);
      res.json(listing);
    } catch (error) {
      res.status(500).json({ message: 'Error updating listing', error: error.message });
    }
  },

  addPhotos: async (req, res) => {
    res.json({ message: 'Photo upload not implemented yet' });
  }
};