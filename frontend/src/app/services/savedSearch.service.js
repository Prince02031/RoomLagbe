import api from './api';

/**
 * Saved Search Service
 * Handles all saved search-related API calls
 */

const savedSearchService = {
    /**
     * Get all saved searches for the current user
     * @returns {Promise<Array>} List of saved searches
     */
    async getAll() {
        try {
            const response = await api.get('/saved-searches');
            return response.data;
        } catch (error) {
            console.error('Error fetching saved searches:', error);
            throw error.response?.data || error;
        }
    },

    /**
     * Create a new saved search
     * @param {Object} searchData - Search data to save
     * @param {string} searchData.name - Name of the saved search
     * @param {Object} searchData.filters - Filter criteria
     * @param {string} searchData.filters.location_id - Location filter
     * @param {string} searchData.filters.listing_type - Listing type filter
     * @param {number} searchData.filters.min_price - Minimum price
     * @param {number} searchData.filters.max_price - Maximum price
     * @param {boolean} searchData.filters.women_only - Women only filter
     * @returns {Promise<Object>} Created saved search
     */
    async create(searchData) {
        try {
            const response = await api.post('/saved-searches', searchData);
            return response.data;
        } catch (error) {
            console.error('Error creating saved search:', error);
            throw error.response?.data || error;
        }
    },

    /**
     * Delete a saved search by ID
     * @param {string} id - Saved search ID
     * @returns {Promise<void>}
     */
    async delete(id) {
        try {
            await api.delete(`/saved-searches/${id}`);
        } catch (error) {
            console.error('Error deleting saved search:', error);
            throw error.response?.data || error;
        }
    }
};

export default savedSearchService;
