import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model.js';

export const register = async (req, res) => {
  const { username, password, name, email, phone, role } = req.body;

  try {
    // 1. Check if user exists (DB query)
    const existingUser = await UserModel.findByUsername(username);

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Save user (DB query)
    const newUser = await UserModel.create({
      username,
      password: hashedPassword,
      name: name || username,
      email,
      phone,
      role: role || 'student'  // lowercase for enum
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        user_id: newUser.user_id,
        id: newUser.user_id,
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Find user (DB query)
    const user = await UserModel.findByUsername(username);

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3. Generate JWT Token with user_id (not id)
    const payload = {
      user_id: user.user_id,  // Changed from id to user_id
      id: user.user_id,       // Keep id for backward compatibility
      role: user.role,
      username: user.username
    };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }  // Extended to 24 hours
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        id: user.user_id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        verification_status: user.verification_status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};