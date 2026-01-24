import { ApartmentModel } from '../models/apartment.model.js';
import { ListingModel } from '../models/listing.model.js';

export const AdminController = {
  // Get all pending apartments
  getPendingApartments: async (req, res, next) => {
    try {
      const apartments = await ApartmentModel.findPending();
      res.json(apartments);
    } catch (err) {
      next(err);
    }
  },

  // Approve apartment
  approveApartment: async (req, res, next) => {
    try {
      const apartment = await ApartmentModel.updateVerificationStatus(req.params.id, 'verified');
      if (!apartment) {
        return res.status(404).json({ message: 'Apartment not found' });
      }
      res.json({ message: 'Apartment approved', apartment });
    } catch (err) {
      next(err);
    }
  },

  // Reject apartment
  rejectApartment: async (req, res, next) => {
    try {
      const { reason } = req.body;
      const apartment = await ApartmentModel.updateVerificationStatus(req.params.id, 'unverified');
      if (!apartment) {
        return res.status(404).json({ message: 'Apartment not found' });
      }
      // TODO: Send notification to owner with rejection reason
      res.json({ message: 'Apartment rejected', apartment, reason });
    } catch (err) {
      next(err);
    }
  },

  // Get all pending listings
  getPendingListings: async (req, res, next) => {
    try {
      const listings = await ListingModel.findPending();
      res.json(listings);
    } catch (err) {
      next(err);
    }
  },

  // Approve listing
  approveListing: async (req, res, next) => {
    try {
      const listing = await ListingModel.updateVerificationStatus(req.params.id, 'verified');
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
      res.json({ message: 'Listing approved', listing });
    } catch (err) {
      next(err);
    }
  },

  // Reject listing
  rejectListing: async (req, res, next) => {
    try {
      const { reason } = req.body;
      const listing = await ListingModel.updateVerificationStatus(req.params.id, 'unverified');
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
      // TODO: Send notification to owner with rejection reason
      res.json({ message: 'Listing rejected', listing, reason });
    } catch (err) {
      next(err);
    }
  }
};
