import api from './api.js';

/**
 * Admin Service
 * Handles all admin-related API calls
 */

const adminService = {
    // ---- Apartment Verification ----
    async getPendingApartments() {
        try {
            const response = await api.get('/admin/apartments/pending');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async approveApartment(id) {
        try {
            const response = await api.patch(`/admin/apartments/${id}/approve`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async rejectApartment(id, reason) {
        try {
            const response = await api.patch(`/admin/apartments/${id}/reject`, { reason });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // ---- Listing Verification ----
    async getPendingListings() {
        try {
            const response = await api.get('/admin/listings/pending');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async approveListing(id) {
        try {
            const response = await api.patch(`/admin/listings/${id}/approve`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async rejectListing(id, reason) {
        try {
            const response = await api.patch(`/admin/listings/${id}/reject`, { reason });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // ---- User Verification ----
    async getPendingStudents() {
        try {
            const response = await api.get('/admin/users/pending/students');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async getPendingOwners() {
        try {
            const response = await api.get('/admin/users/pending/owners');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async approveUser(userId) {
        try {
            const response = await api.patch(`/admin/users/${userId}/approve`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    async rejectUser(userId) {
        try {
            const response = await api.patch(`/admin/users/${userId}/reject`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};

export default adminService;
