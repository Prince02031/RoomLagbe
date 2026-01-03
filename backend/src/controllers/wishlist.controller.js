import { WishlistService } from '../services/wishlist.service.js';

export const WishlistController = {
  add: async (req, res, next) => {
    try {
      const { listingId } = req.body;
      const item = await WishlistService.addToWishlist(req.user.id, listingId);
      // If the item was already in the wishlist, the model returns nothing.
      // We can respond with a success or the created item.
      if (item) {
        res.status(201).json(item);
      } else {
        res.status(200).json({ message: 'Item already in wishlist.' });
      }
    } catch (err) {
      next(err);
    }
  },

  remove: async (req, res, next) => {
    try {
      await WishlistService.removeFromWishlist(req.user.id, req.params.listingId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  getMyWishlist: async (req, res, next) => {
    try {
      const wishlist = await WishlistService.getWishlistForUser(req.user.id);
      res.json(wishlist);
    } catch (err) {
      next(err);
    }
  },

  getTopWishlisted: async (req, res, next) => {
    try {
      const top = await WishlistService.getTopWishlistedListings();
      res.json(top);
    } catch (err) {
      next(err);
    }
  }
};