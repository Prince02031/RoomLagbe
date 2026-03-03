import { ApartmentModel } from '../models/apartment.model.js';
import { ListingModel } from '../models/listing.model.js';
import { UserModel } from '../models/user.model.js';
import { NotificationModel } from '../models/notification.model.js';

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
  },

  // ---- User Verification ----

  // Get all pending student verifications
  getPendingStudents: async (req, res, next) => {
    try {
      const students = await UserModel.findByVerificationStatus('pending', 'student');
      // Remove passwords from response
      const safe = students.map(({ password, ...u }) => u);
      res.json(safe);
    } catch (err) {
      next(err);
    }
  },

  // Get all pending owner verifications
  getPendingOwners: async (req, res, next) => {
    try {
      const owners = await UserModel.findByVerificationStatus('pending', 'owner');
      const safe = owners.map(({ password, ...u }) => u);
      res.json(safe);
    } catch (err) {
      next(err);
    }
  },

  // Approve user verification
  approveUser: async (req, res, next) => {
    try {
      const user = await UserModel.updateVerificationStatus(req.params.id, 'verified');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.role === 'student') {
        await NotificationModel.create({
          user_id: user.user_id,
          type: 'verification_approved',
          title: 'Verification Approved',
          message: 'Your verification request has been approved.',
          meta: { user_id: user.user_id },
        });
      }

      const { password, ...safe } = user;
      res.json({ message: 'User verification approved', user: safe });
    } catch (err) {
      next(err);
    }
  },

  // Reject user verification
  rejectUser: async (req, res, next) => {
    try {
      const user = await UserModel.updateVerificationStatus(req.params.id, 'unverified');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const { password, ...safe } = user;
      res.json({ message: 'User verification rejected', user: safe });
    } catch (err) {
      next(err);
    }
  }
};
