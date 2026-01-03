import { AmenityService } from '../services/amenity.service.js';

export const AmenityController = {
  // --- Master Amenity List ---
  create: async (req, res, next) => {
    try {
      const { name } = req.body;
      const amenity = await AmenityService.createAmenity(name);
      res.status(201).json(amenity);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      await AmenityService.deleteAmenity(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
  
  getAll: async (req, res, next) => {
    try {
      const amenities = await AmenityService.getAllAmenities();
      res.json(amenities);
    } catch (err) {
      next(err);
    }
  },

  // --- Apartment Amenity Associations ---
  getForApartment: async (req, res, next) => {
    try {
      const amenities = await AmenityService.getAmenitiesForApartment(req.params.apartmentId);
      res.json(amenities);
    } catch (err) {
      next(err);
    }
  },

  addToApartment: async (req, res, next) => {
    try {
      const { apartmentId, amenityId } = req.params;
      await AmenityService.addAmenityToApartment(apartmentId, amenityId, req.user.id);
      res.status(201).send();
    } catch (err) {
      next(err);
    }
  },

  removeFromApartment: async (req, res, next) => {
    try {
      const { apartmentId, amenityId } = req.params;
      await AmenityService.removeAmenityFromApartment(apartmentId, amenityId, req.user.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  // --- Room Amenity Associations ---
  getForRoom: async (req, res, next) => {
    try {
      const amenities = await AmenityService.getAmenitiesForRoom(req.params.roomId);
      res.json(amenities);
    } catch (err) {
      next(err);
    }
  },

  addToRoom: async (req, res, next) => {
    try {
      const { roomId, amenityId } = req.params;
      await AmenityService.addAmenityToRoom(roomId, amenityId, req.user.id);
      res.status(201).send();
    } catch (err) {
      next(err);
    }
  },

  removeFromRoom: async (req, res, next) => {
    try {
      const { roomId, amenityId } = req.params;
      await AmenityService.removeAmenityFromRoom(roomId, amenityId, req.user.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
};