import { ApartmentModel } from '../models/apartment.model.js';

export const ApartmentController = {
  create: async (req, res, next) => {
    try {
      const apartmentData = { ...req.body, owner_id: req.user.id };
      const apartment = await ApartmentModel.create(apartmentData);
      res.status(201).json(apartment);
    } catch (err) {
      next(err);
    }
  },

  getMyApartments: async (req, res, next) => {
    try {
      const apartments = await ApartmentModel.findByOwner(req.user.id);
      res.json(apartments);
    } catch (err) {
      next(err);
    }
  },

  getById: async (req, res, next) => {
    try {
      const apartment = await pool.query('SELECT * FROM APARTMENT WHERE apartment_id = $1', [req.params.id]);
      res.json(apartment.rows[0]);
    } catch (err) {
      next(err);
    }
  }
};