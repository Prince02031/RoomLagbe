import { SavedSearchService } from '../services/savedSearch.service.js';

export const SavedSearchController = {
  create: async (req, res, next) => {
    try {
      const { name, ...criteria } = req.body;
      const savedSearch = await SavedSearchService.createSavedSearch(req.user.id, { name, criteria });
      res.status(201).json(savedSearch);
    } catch (err) {
      next(err);
    }
  },

  getMySavedSearches: async (req, res, next) => {
    try {
      const searches = await SavedSearchService.getSavedSearchesForUser(req.user.id);
      res.json(searches);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      await SavedSearchService.deleteSavedSearch(req.params.id, req.user.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
};