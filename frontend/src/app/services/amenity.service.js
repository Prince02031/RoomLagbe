import api from './api.js';

/**
 * Amenity Service
 * Handles amenity-related API calls
 */

const amenityService = {
    /**
     * Get all amenities
     * @returns {Promise<Array>} List of amenities
     */
    async getAll() {
        try {
            const response = await api.get('/amenities');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get amenities for a specific apartment
     * @param {string} apartmentId - Apartment ID
     * @returns {Promise<Array>} List of amenities for the apartment
     */
    async getByApartment(apartmentId) {
        try {
            const response = await api.get(`/amenities/apartment/${apartmentId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get amenities for a specific room
     * @param {string} roomId - Room ID
     * @returns {Promise<Array>} List of amenities for the room
     */
    async getByRoom(roomId) {
        try {
            const response = await api.get(`/amenities/room/${roomId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};

export default amenityService;
