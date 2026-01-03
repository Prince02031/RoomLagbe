import { UserModel } from '../models/user.model.js';

export const UserController = {
  getProfile: async (req, res, next) => {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (err) {
      next(err);
    }
  },

  getById: async (req, res, next) => {
    try {
      const user = await UserModel.findById(req.params.id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }
};