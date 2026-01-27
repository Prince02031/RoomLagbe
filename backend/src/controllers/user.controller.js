import { UserModel } from '../models/user.model.js';
import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';

export const UserController = {
  getProfile: async (req, res, next) => {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err) {
      next(err);
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      const { name, email, phone } = req.body;
      
      // Check if email is already taken by another user
      if (email) {
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser && existingUser.user_id !== req.user.id) {
          return res.status(400).json({ message: 'Email already in use' });
        }
      }

      const updatedUser = await UserModel.update(req.user.id, { name, email, phone });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (err) {
      next(err);
    }
  },

  changePassword: async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
      }

      // Get user with password
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await pool.query(
        'UPDATE "user" SET password = $1 WHERE user_id = $2',
        [hashedPassword, req.user.id]
      );

      res.json({ message: 'Password changed successfully' });
    } catch (err) {
      next(err);
    }
  },

  getById: async (req, res, next) => {
    try {
      const user = await UserModel.findById(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err) {
      next(err);
    }
  }
};