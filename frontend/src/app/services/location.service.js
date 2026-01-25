import api from './api.js';

/**
 * Location Service
 * Handles location-related API calls
 */

const locationService = {
    /**
     * Get all locations
     * @returns {Promise<Array>} List of locations
     */
    async getAll() {
        try {
            const response = await api.get('/locations');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get a single location by ID
     * @param {string} id - Location ID
     * @returns {Promise<Object>} Location details
     */
    async getById(id) {
        try {
            const response = await api.get(`/locations/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};

export default locationService;
