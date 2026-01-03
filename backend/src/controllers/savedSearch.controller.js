import { SavedSearchModel } from '../models/savedSearch.model.js';

export const SavedSearchController = {
  create: async (req, res, next) => {
    try {
      const savedSearch = await SavedSearchModel.create(req.user.id, req.body);
      res.status(201).json(savedSearch);
    } catch (err) {
      next(err);
    }
  },

  getMySavedSearches: async (req, res, next) => {
    try {
      const searches = await SavedSearchModel.findByUser(req.user.id);
      res.json(searches);
    } catch (err) {
      next(err);
    }
  }
};