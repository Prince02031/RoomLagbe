import { UniversityModel } from '../models/university.model.js';

export const UniversityController = {
  getAll: async (req, res, next) => {
    try {
      const universities = await UniversityModel.findAll();
      res.json(universities);
    } catch (err) {
      next(err);
    }
  }
};