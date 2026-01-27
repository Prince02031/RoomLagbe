import api from './api';

/**
 * Booking Service
 * Handles all booking-related API calls
 */

const bookingService = {
    /**
     * Create a new booking request
     * @param {Object} bookingData - Booking data
     * @param {string} bookingData.listing_id - Listing ID
     * @param {string} bookingData.visit_date - Visit date
     * @param {string} bookingData.visit_time - Visit time
     * @param {string} bookingData.message - Optional message
     * @returns {Promise<Object>} Created booking
     */
    async create(bookingData) {
        try {
            const response = await api.post('/bookings', bookingData);
            return response.data;
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error.response?.data || error;
        }
    },

    /**
     * Get student's bookings
     * @returns {Promise<Array>} List of student bookings
     */
    async getMyBookings() {
        try {
            const response = await api.get('/bookings/student');
            return response.data;
        } catch (error) {
            console.error('Error fetching student bookings:', error);
            throw error.response?.data || error;
        }
    },

    /**
     * Get owner's bookings (booking requests for their listings)
     * @returns {Promise<Array>} List of owner bookings
     */
    async getOwnerBookings() {
        try {
            const response = await api.get('/bookings/owner');
            return response.data;
        } catch (error) {
            console.error('Error fetching owner bookings:', error);
            throw error.response?.data || error;
        }
    },

    /**
     * Update booking status (owner only)
     * @param {string} bookingId - Booking ID
     * @param {string} status - New status ('approved', 'rejected')
     * @returns {Promise<Object>} Updated booking
     */
    async updateStatus(bookingId, status) {
        try {
            const response = await api.patch(`/bookings/${bookingId}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('Error updating booking status:', error);
            throw error.response?.data || error;
        }
    }
};

export default bookingService;
