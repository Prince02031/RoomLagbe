import { WishlistModel } from '../models/wishlist.model.js';

export const WishlistController = {
  add: async (req, res, next) => {
    try {
      const { listingId } = req.body;
      const item = await WishlistModel.add(req.user.id, listingId);
      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  },

  remove: async (req, res, next) => {
    try {
      await WishlistModel.remove(req.user.id, req.params.listingId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  getMyWishlist: async (req, res, next) => {
    try {
      const wishlist = await WishlistModel.getByUser(req.user.id);
      res.json(wishlist);
    } catch (err) {
      next(err);
    }
  },

  getTopWishlisted: async (req, res, next) => {
    try {
      const top = await WishlistModel.getTopWishlisted();
      res.json(top);
    } catch (err) {
      next(err);
    }
  }
};