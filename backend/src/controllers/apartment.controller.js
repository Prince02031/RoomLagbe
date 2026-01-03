import { ApartmentService } from '../services/apartment.service.js';

export const ApartmentController = {
  create: async (req, res, next) => {
    try {
      const apartmentData = { ...req.body, owner_id: req.user.id };
      const apartment = await ApartmentService.create(apartmentData);
      res.status(201).json(apartment);
    } catch (err) {
      next(err);
    }
  },

  getMyApartments: async (req, res, next) => {
    try {
      const apartments = await ApartmentService.getApartmentsByOwner(req.user.id);
      res.json(apartments);
    } catch (err) {
      next(err);
    }
  },

  getById: async (req, res, next) => {
    try {
      const apartment = await ApartmentService.getApartmentById(req.params.id);
      res.json(apartment);
    } catch (err) {
      next(err);
    }
  }
};