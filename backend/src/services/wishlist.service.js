import { WishlistModel } from '../models/wishlist.model.js';
import { ListingModel } from '../models/listing.model.js';
import { ApartmentMetricsModel } from '../models/apartmentMetrics.model.js';

export const WishlistService = {
  /**
   * Adds a listing to a user's wishlist.
   * @param {number} userId - The ID of the user.
   * @param {number} listingId - The ID of the listing to add.
   * @returns {Promise<object>} The created wishlist item.
   * @throws {Error} If the listing does not exist.
   */
  addToWishlist: async (userId, listingId) => {
    const listing = await ListingModel.findById(listingId);
    if (!listing) {
      throw new Error('Listing not found.');
    }
    const item = await WishlistModel.add(userId, listingId);

    // Sync wishlist count non-blocking
    if (listing.apartment_id) {
      ApartmentMetricsModel.syncWishlistCount(listing.apartment_id)
        .catch(err => console.warn('Wishlist count sync failed:', err.message));
    }

    return item;
  },

  /**
   * Removes a listing from a user's wishlist.
   * @param {number} userId - The ID of the user.
   * @param {number} listingId - The ID of the listing to remove.
   */
  removeFromWishlist: async (userId, listingId) => {
    const listing = await ListingModel.findById(listingId).catch(() => null);
    await WishlistModel.remove(userId, listingId);

    // Sync wishlist count non-blocking
    if (listing?.apartment_id) {
      ApartmentMetricsModel.syncWishlistCount(listing.apartment_id)
        .catch(err => console.warn('Wishlist count sync failed:', err.message));
    }
  },

  /**
   * Retrieves the wishlist for a specific user.
   * @param {number} userId - The ID of the user.
   * @returns {Promise<Array<object>>} A list of wishlist items with listing details.
   */
  getWishlistForUser: async (userId) => {
    return await WishlistModel.getByUser(userId);
  },

  /**
   * Gets the most wishlisted listings.
   * @returns {Promise<Array<object>>} A list of top listings and their wishlist count.
   */
  getTopWishlistedListings: async () => {
    // This could be expanded to join with listing details if needed.
    return await WishlistModel.getTopWishlisted();
  }
};
