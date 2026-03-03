
import { UserModel } from '../models/user.model.js';
import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';
import supabase from '../config/supabase.js';

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
  },

  // Handle verification submission
  submitVerification: async (req, res, next) => {
    try {
      const { role, id: userId } = req.user;
      let updateFields = { verification_status: 'pending' };

      // Helper to upload a file buffer to Supabase Storage
      async function uploadToSupabase(file, folder) {
        const ext = file.originalname.split('.').pop();
        const filename = `${userId}_${Date.now()}.${ext}`;
        const { data, error } = await supabase.storage
          .from('verification')
          .upload(`${folder}/${filename}`, file.buffer, {
            contentType: file.mimetype,
            upsert: true
          });
        if (error) throw error;
        // Get public URL
        const { data: publicUrlData } = supabase.storage.from('verification').getPublicUrl(`${folder}/${filename}`);
        return publicUrlData.publicUrl;
      }

      if (role === 'student') {
        updateFields.student_id = req.body.studentId;
        updateFields.university = req.body.university;
        if (req.files && req.files.studentProof && req.files.studentProof[0]) {
          const file = req.files.studentProof[0];
          updateFields.student_proof = await uploadToSupabase(file, 'student');
        }
      } else if (role === 'owner') {
        updateFields.nid = req.body.ownerNid;
        updateFields.contact = req.body.contact;
        if (req.files && req.files.ownershipProof && req.files.ownershipProof[0]) {
          const file = req.files.ownershipProof[0];
          updateFields.ownership_proof = await uploadToSupabase(file, 'owner');
        }
      } else {
        return res.status(400).json({ message: 'Verification not supported for this role.' });
      }
      // Save verification info to user
      const updatedUser = await UserModel.update(userId, updateFields);
      res.json({ message: 'Verification info submitted', user: updatedUser });
    } catch (err) {
      next(err);
    }
  }
};