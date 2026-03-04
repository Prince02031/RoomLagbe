import { ApartmentModel } from '../models/apartment.model.js';
import { ListingModel } from '../models/listing.model.js';
import { UserModel } from '../models/user.model.js';
import { NotificationModel } from '../models/notification.model.js';
import { pool } from '../config/db.js';

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
      NotificationModel.create({
        user_id: apartment.owner_id,
        type: 'verification_rejected',
        title: 'Apartment Rejected',
        message: reason ? `Your apartment listing was rejected: ${reason}` : 'Your apartment listing was rejected by admin.',
        meta: { apartment_id: apartment.apartment_id },
      }).catch(() => {});
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
      const full = await ListingModel.findWithOwner(req.params.id);
      if (full?.owner_id) {
        NotificationModel.create({
          user_id: full.owner_id,
          type: 'verification_rejected',
          title: 'Listing Rejected',
          message: reason ? `Your listing was rejected: ${reason}` : 'Your listing was rejected by admin.',
          meta: { listing_id: listing.listing_id },
        }).catch(() => {});
      }
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
  },

  getAnalyticsSummary: async (req, res, next) => {
    try {
      const [listingStats, areaStats, topByViews, topByWishlist] = await Promise.all([
        pool.query(`
          SELECT
            COUNT(*)                                                     AS total_listings,
            COUNT(*) FILTER (WHERE listing_type = 'apartment')          AS apartment_count,
            COUNT(*) FILTER (WHERE listing_type = 'room_share')         AS room_share_count,
            COUNT(*) FILTER (WHERE availability_status = 'available')   AS available_count,
            COUNT(*) FILTER (WHERE women_only = true)                   AS women_only_count,
            ROUND(AVG(price_per_person))                                AS avg_rent,
            ROUND(MIN(price_per_person))                                AS min_rent,
            ROUND(MAX(price_per_person))                                AS max_rent
          FROM listing
        `),
        pool.query(`
          SELECT
            COALESCE(loc.area_name, rloc.area_name, 'Unknown') AS area,
            COUNT(*)                                           AS count,
            ROUND(AVG(l.price_per_person))                    AS avg_price,
            ROUND(MIN(l.price_per_person))                    AS min_price,
            ROUND(MAX(l.price_per_person))                    AS max_price
          FROM listing l
          LEFT JOIN apartment a   ON l.apartment_id = a.apartment_id
          LEFT JOIN room r        ON l.room_id = r.room_id
          LEFT JOIN apartment ra  ON r.apartment_id = ra.apartment_id
          LEFT JOIN location loc  ON a.location_id = loc.location_id
          LEFT JOIN location rloc ON ra.location_id = rloc.location_id
          WHERE l.price_per_person > 0
          GROUP BY COALESCE(loc.area_name, rloc.area_name, 'Unknown')
          ORDER BY avg_price DESC
        `),
        pool.query(`
          SELECT l.listing_id,
                 COALESCE(a.title, ra.title, 'Listing')      AS title,
                 COALESCE(loc.area_name, rloc.area_name)     AS area,
                 l.price_per_person,
                 am.view_count
          FROM listing l
          LEFT JOIN apartment a   ON l.apartment_id = a.apartment_id
          LEFT JOIN room r        ON l.room_id = r.room_id
          LEFT JOIN apartment ra  ON r.apartment_id = ra.apartment_id
          LEFT JOIN location loc  ON a.location_id = loc.location_id
          LEFT JOIN location rloc ON ra.location_id = rloc.location_id
          LEFT JOIN apartment_metrics am
            ON am.apartment_id = COALESCE(a.apartment_id, ra.apartment_id)
          WHERE am.view_count > 0
          ORDER BY am.view_count DESC
          LIMIT 5
        `),
        pool.query(`
          SELECT l.listing_id,
                 COALESCE(a.title, ra.title, 'Listing')      AS title,
                 COALESCE(loc.area_name, rloc.area_name)     AS area,
                 l.price_per_person,
                 am.wishlist_count
          FROM listing l
          LEFT JOIN apartment a   ON l.apartment_id = a.apartment_id
          LEFT JOIN room r        ON l.room_id = r.room_id
          LEFT JOIN apartment ra  ON r.apartment_id = ra.apartment_id
          LEFT JOIN location loc  ON a.location_id = loc.location_id
          LEFT JOIN location rloc ON ra.location_id = rloc.location_id
          LEFT JOIN apartment_metrics am
            ON am.apartment_id = COALESCE(a.apartment_id, ra.apartment_id)
          WHERE am.wishlist_count > 0
          ORDER BY am.wishlist_count DESC
          LIMIT 5
        `),
      ]);

      const s = listingStats.rows[0];
      res.json({
        totalListings:  parseInt(s.total_listings),
        apartmentCount: parseInt(s.apartment_count),
        roomShareCount: parseInt(s.room_share_count),
        availableCount: parseInt(s.available_count),
        womenOnlyCount: parseInt(s.women_only_count),
        avgRent:        parseFloat(s.avg_rent)  || 0,
        minRent:        parseFloat(s.min_rent)  || 0,
        maxRent:        parseFloat(s.max_rent)  || 0,
        areaStats: areaStats.rows.map(r => ({
          area:     r.area,
          count:    parseInt(r.count),
          avgPrice: parseFloat(r.avg_price),
          minPrice: parseFloat(r.min_price),
          maxPrice: parseFloat(r.max_price),
        })),
        topByViews: topByViews.rows.map(r => ({
          listingId:    r.listing_id,
          title:        r.title,
          area:         r.area,
          pricePerPerson: parseFloat(r.price_per_person),
          viewCount:    parseInt(r.view_count),
        })),
        topByWishlist: topByWishlist.rows.map(r => ({
          listingId:    r.listing_id,
          title:        r.title,
          area:         r.area,
          pricePerPerson: parseFloat(r.price_per_person),
          wishlistCount: parseInt(r.wishlist_count),
        })),
      });
    } catch (err) {
      next(err);
    }
  },
};
