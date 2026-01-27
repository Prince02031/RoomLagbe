import api from './api.js';

/**
 * Listing Service
 * Handles all listing-related API calls
 */

const listingService = {
    /**
     * Get all listings with optional filters
     * @param {Object} filters - Filter parameters
     * @param {string} filters.location_id - Filter by location
     * @param {string} filters.listing_type - apartment or room_share
     * @param {number} filters.min_price - Minimum price per person
     * @param {number} filters.max_price - Maximum price per person
     * @param {boolean} filters.women_only - Women only filter
     * @returns {Promise<Array>} List of listings
     */
    async getAll(filters = {}) {
        try {
            const params = new URLSearchParams();

            if (filters.location_id) params.append('location_id', filters.location_id);
            if (filters.listing_type) params.append('listing_type', filters.listing_type);
            if (filters.min_price) params.append('min_price', filters.min_price);
            if (filters.max_price) params.append('max_price', filters.max_price);
            if (filters.women_only !== undefined) params.append('women_only', filters.women_only);

            const queryString = params.toString();
            const url = queryString ? `/listings?${queryString}` : '/listings';

            const response = await api.get(url);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get a single listing by ID
     * @param {string} id - Listing ID
     * @returns {Promise<Object>} Listing details
     */
    async getById(id) {
        try {
            const response = await api.get(`/listings/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Create a new listing
     * @param {Object} listingData - Listing data
     * @returns {Promise<Object>} Created listing
     */
    async create(listingData) {
        try {
            const response = await api.post('/listings', listingData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Update a listing
     * @param {string} id - Listing ID
     * @param {Object} updates - Updated data
     * @returns {Promise<Object>} Updated listing
     */
    async update(id, updates) {
        try {
            const response = await api.put(`/listings/${id}`, updates);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get current user's listings
     * @returns {Promise<Array>} List of user listings
     */
    async getMine() {
        try {
            const response = await api.get('/listings/mine');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};

export default listingService;
