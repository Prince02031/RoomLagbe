import api from './api.js';

/**
 * Authentication Service
 * Handles user registration, login, logout, and token management
 */

const authService = {
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @param {string} userData.username - Username
     * @param {string} userData.password - Password
     * @param {string} userData.name - Full name
     * @param {string} userData.email - Email address
     * @param {string} userData.phone - Phone number
     * @param {string} userData.role - User role (student/owner)
     * @returns {Promise<Object>} User data
     */
    async register(userData) {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Login user
     * @param {string} username - Username
     * @param {string} password - Password
     * @returns {Promise<Object>} Token and user data
     */
    async login(username, password) {
        try {
            const response = await api.post('/auth/login', { username, password });
            const { token, user } = response.data;

            // Store token and user in localStorage
            if (token) {
                localStorage.setItem('token', token);
            }
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
            }

            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Logout user
     * Clears token and user data from localStorage
     */
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    /**
     * Get current user from localStorage
     * @returns {Object|null} User data or null if not logged in
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;

        try {
            return JSON.parse(userStr);
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    },

    /**
     * Get JWT token from localStorage
     * @returns {string|null} JWT token or null
     */
    getToken() {
        return localStorage.getItem('token');
    },

    /**
     * Check if user is authenticated
     * @returns {boolean} True if user is authenticated
     */
    isAuthenticated() {
        return !!this.getToken();
    },
};

export default authService;
