import { AmenityModel } from '../models/amenity.model.js';

export const AmenityController = {
  getAll: async (req, res, next) => {
    try {
      const amenities = await AmenityModel.findAll();
      res.json(amenities);
    } catch (err) {
      next(err);
    }
  }
};