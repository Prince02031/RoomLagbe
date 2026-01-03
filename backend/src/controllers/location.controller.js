import { LocationModel } from '../models/location.model.js';

export const LocationController = {
  getAll: async (req, res, next) => {
    try {
      const locations = await LocationModel.findAll();
      res.json(locations);
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const location = await LocationModel.create(req.body);
      res.status(201).json(location);
    } catch (err) {
      next(err);
    }
  }
};