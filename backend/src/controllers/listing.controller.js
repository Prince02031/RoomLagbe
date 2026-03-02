
import { ListingModel } from '../models/listing.model.js';
import { ApartmentModel } from '../models/apartment.model.js';
import { RoomModel } from '../models/room.model.js';
import { AmenityModel } from '../models/amenity.model.js';
import { ListingPhotoModel } from '../models/listingPhoto.model.js';
import supabase from '../config/supabase.js';
import { config } from '../config/env.js';

export const ListingController = {
  // Get all listings (with optional filters)
  getAll: async (req, res) => {
    try {
      const listings = await ListingModel.findAll(req.query);
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
      const photos = await ListingPhotoModel.getByListing(id);
      const photoUrls = photos.map((photo) => photo.photo_url).filter(Boolean);
      const thumbnail = photos.find((photo) => photo.is_thumbnail)?.photo_url || photoUrls[0] || null;

      res.json({
        ...listing,
        photos: photoUrls,
        thumbnail,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching listing', error: error.message });
    }
  },

  // Create a new listing
  create: async (req, res) => {
    try {
      const { listing_type } = req.body;
      const userRole = req.user.role;

      // Business rule validation
      if (userRole === 'owner' && listing_type !== 'apartment') {
        return res.status(403).json({
          message: 'Owners can only create apartment listings (whole flat)'
        });
      }

      if (userRole === 'student' && listing_type !== 'room_share') {
        return res.status(403).json({
          message: 'Students can only create room_share listings (individual rooms)'
        });
      }

      let apartment_id = req.body.apartment_id;
      let room_id = req.body.room_id;

      // If no apartment_id is provided, create the apartment first
      if (!apartment_id) {
        // For students posting room shares, create a minimal apartment entry
        // The student becomes a temporary "owner" for database constraints
        const apartment = await ApartmentModel.create({
          ...req.body,
          owner_id: req.user.id, // Student's ID used as placeholder
        });
        apartment_id = apartment.apartment_id;
      }

      // If it's a room_share listing and no room_id is provided, create the room first
      if (listing_type === 'room_share' && !room_id) {
        const room = await RoomModel.create({
          apartment_id,
          std_id: req.user.id,
          room_name: req.body.room_name || req.body.title || 'Shared Room',
          capacity: req.body.max_occupancy || 1,
          price_per_person: req.body.price_per_person,
          women_only: req.body.women_only || false
        });
        room_id = room.room_id;
      }

      // Create the listing
      const listing = await ListingModel.create({
        ...req.body,
        apartment_id: listing_type === 'apartment' ? apartment_id : null,
        room_id: listing_type === 'room_share' ? room_id : null,
        listing_type,
        price_per_person: req.body.price_per_person || (listing_type === 'apartment' ? Math.ceil(req.body.price_total / req.body.max_occupancy) : 0),
        ownerId: req.user.id
      });

      // Save amenity associations if provided
      if (req.body.amenities && Array.isArray(req.body.amenities) && req.body.amenities.length > 0) {
        for (const amenityId of req.body.amenities) {
          if (listing_type === 'apartment') {
            await AmenityModel.addApartmentAmenity(apartment_id, amenityId);
          } else if (listing_type === 'room_share' && room_id) {
            await AmenityModel.addRoomAmenity(room_id, amenityId);
          }
        }
      }

      res.status(201).json(listing);
    } catch (error) {
      console.error('Create listing error:', error);
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

  // Get current user's listings
  getMine: async (req, res) => {
    try {
      const listings = await ListingModel.findByUser(req.user.id);
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching your listings', error: error.message });
    }
  },

  addPhotos: async (req, res) => {
    try {
      const listingId = req.body?.listingId || req.query?.listingId;
      const files = Array.isArray(req.files) ? req.files : [];

      if (!listingId) {
        return res.status(400).json({ message: 'listingId is required' });
      }
      if (files.length === 0) {
        return res.status(400).json({
          message: 'No files uploaded',
          debug: {
            contentType: req.headers['content-type'],
            bodyKeys: Object.keys(req.body || {}),
          },
        });
      }

      // Optionally, check if the user owns the listing
      const listing = await ListingModel.findWithOwner(listingId);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
      if (listing.owner_id !== req.user.id) {
        return res.status(403).json({ message: 'You are not authorized to add photos to this listing.' });
      }

      const uploadedPhotos = [];
      const bucketName = config.listingPhotosBucket;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.originalname.split('.').pop();
        const filename = `${listingId}_${Date.now()}_${i}.${ext}`;
        // Upload to Supabase Storage (listing-photos bucket)
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filename, file.buffer, {
            contentType: file.mimetype,
            upsert: true
          });
        if (error) {
          return res.status(500).json({
            message: 'Error uploading photos',
            error: error?.message || 'Supabase storage upload failed',
            details: {
              bucket: bucketName,
              code: error?.code,
              statusCode: error?.statusCode || error?.status,
            },
          });
        }
        // Get public URL
        const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filename);
        const photoUrl = publicUrlData.publicUrl;
        // Save to DB
        const photo = await ListingPhotoModel.add(listingId, photoUrl, i === 0); // First photo is thumbnail
        uploadedPhotos.push(photo);
      }
      res.json({ message: 'Photos uploaded', photos: uploadedPhotos });
    } catch (error) {
      res.status(500).json({
        message: 'Error uploading photos',
        error: error?.message || 'Unknown upload error',
        details: {
          name: error?.name,
          statusCode: error?.statusCode || error?.status,
          code: error?.code,
        },
      });
    }
  }
};