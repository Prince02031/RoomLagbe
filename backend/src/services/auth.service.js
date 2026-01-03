import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.model.js';
import { generateToken } from '../utils/jwt.js';

export const AuthService = {
  /**
   * Registers a new user.
   * @param {object} userData - The user's registration data ({ name, email, phone, password, role }).
   * @returns {Promise<{user: object, token: string}>} The new user and a JWT.
   * @throws {Error} If the user already exists or if there's a database error.
   */
  register: async (userData) => {
    const { name, email, phone, password, role } = userData;

    // It's good practice to check if the user already exists in the service layer
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new Error('An account with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await UserModel.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role
    });

    if (!user) {
      throw new Error('User could not be created.');
    }

    const tokenPayload = { id: user.user_id, role: user.role };
    const token = generateToken(tokenPayload);

    // It's safer to not return the password hash
    const { password_hash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  },

  /**
   * Logs a user in.
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   * @returns {Promise<{user: object, token: string}>} The user and a JWT.
   * @throws {Error} If credentials are invalid.
   */
  login: async (email, password) => {
    const user = await UserModel.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new Error('Invalid email or password');
    }

    const tokenPayload = { id: user.user_id, role: user.role };
    const token = generateToken(tokenPayload);
    
    // It's safer to not return the password hash
    const { password_hash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }
};
