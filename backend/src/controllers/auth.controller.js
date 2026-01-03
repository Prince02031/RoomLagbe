import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model.js';
import { config } from '../config/env.js';

export const AuthController = {
  register: async (req, res, next) => {
    try {
      const { name, email, phone, password, role } = req.body;
      // Hash password before sending to DB/Stored Procedure
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await UserModel.create({ name, email, phone, password: hashedPassword, role });
      
      const token = jwt.sign({ id: user.user_id, role: user.role }, config.jwtSecret, { expiresIn: '1d' });
      res.status(201).json({ user, token });
    } catch (err) {
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findByEmail(email);
      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: user.user_id, role: user.role }, config.jwtSecret, { expiresIn: '1d' });
      res.json({ user, token });
    } catch (err) {
      next(err);
    }
  }
};