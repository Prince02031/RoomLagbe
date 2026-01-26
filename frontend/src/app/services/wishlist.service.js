import api from './api';

const wishlistService = {
    /**
     * Fetch all wishlisted items for the current user
     */
    getWishlist: async () => {
        try {
            const response = await api.get('/wishlist');
            return response.data;
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            throw error;
        }
    },

    /**
     * Add a listing to the user's wishlist
     * @param {string} listingId 
     */
    addToWishlist: async (listingId) => {
        try {
            const response = await api.post('/wishlist', { listingId });
            return response.data;
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            throw error;
        }
    },

    /**
     * Remove a listing from the user's wishlist
     * @param {string} listingId 
     */
    removeFromWishlist: async (listingId) => {
        try {
            await api.delete(`/wishlist/${listingId}`);
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            throw error;
        }
    }
};

export default wishlistService;
