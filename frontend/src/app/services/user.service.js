import api from './api';

/**
 * User Service
 * Handles all user-related API calls
 */

const userService = {
    /**
     * Get current user profile
     * @returns {Promise<Object>} User profile data
     */
    async getProfile() {
        try {
            const response = await api.get('/users/profile');
            return response.data;
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error.response?.data || error;
        }
    },

    /**
     * Update user profile
     * @param {Object} profileData - Profile data to update
     * @param {string} profileData.name - User's full name
     * @param {string} profileData.email - User's email
     * @param {string} profileData.phone - User's phone number
     * @returns {Promise<Object>} Updated user profile
     */
    async updateProfile(profileData) {
        try {
            const response = await api.put('/users/profile', profileData);
            return response.data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error.response?.data || error;
        }
    },

    /**
     * Change user password
     * @param {Object} passwordData - Password change data
     * @param {string} passwordData.currentPassword - Current password
     * @param {string} passwordData.newPassword - New password
     * @returns {Promise<Object>} Success message
     */
    async changePassword(passwordData) {
        try {
            const response = await api.put('/users/change-password', passwordData);
            return response.data;
        } catch (error) {
            console.error('Error changing password:', error);
            throw error.response?.data || error;
        }
    },

    /**
     * Get user by ID
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User data
     */
    async getById(userId) {
        try {
            const response = await api.get(`/users/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error.response?.data || error;
        }
    }
};

export default userService;
