import { SavedSearchModel } from '../models/savedSearch.model.js';

export const SavedSearchService = {
  /**
   * Creates a new saved search for a user.
   * @param {number} userId - The ID of the user.
   * @param {object} data - The search data containing name and criteria.
   * @returns {Promise<object>} The created saved search object.
   */
  createSavedSearch: async (userId, data) => {
    const { name, criteria } = data;
    return await SavedSearchModel.create(userId, name, criteria);
  },

  /**
   * Retrieves all saved searches for a specific user.
   * @param {number} userId - The ID of the user.
   * @returns {Promise<Array<object>>} A list of saved searches.
   */
  getSavedSearchesForUser: async (userId) => {
    return await SavedSearchModel.findByUser(userId);
  },

  /**
   * Deletes a saved search.
   * @param {number} savedSearchId - The ID of the saved search to delete.
   * @param {number} userId - The ID of the user requesting the deletion.
   * @throws {Error} If the saved search is not found or the user is not authorized.
   */
  deleteSavedSearch: async (savedSearchId, userId) => {
    const savedSearch = await SavedSearchModel.findById(savedSearchId);
    if (!savedSearch) {
      throw new Error('Saved search not found.');
    }
    if (savedSearch.user_id !== userId) {
      throw new Error('You are not authorized to delete this saved search.');
    }
    return await SavedSearchModel.remove(savedSearchId);
  }
};
