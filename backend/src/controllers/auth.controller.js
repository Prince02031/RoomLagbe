import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model.js';

export const register = async (req, res) => {
  const { username, password, role } = req.body;

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
    await UserModel.create({
      username,
      password: hashedPassword,
      role: role || 'Student'
    });

    res.status(201).json({ message: 'User registered successfully' });
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

    // 3. Generate JWT Token
    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(
      payload, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '1h' }
    );

    res.json({ 
      message: 'Login successful',
      token 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};