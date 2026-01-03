import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

/**
 * Generates a JSON Web Token.
 * @param {object} payload - The payload to include in the token (e.g., user ID, role).
 * @param {string} [expiresIn='1d'] - The expiration time for the token (e.g., '1h', '7d').
 * @returns {string} The generated JWT.
 */
export const generateToken = (payload, expiresIn = '1d') => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn });
};

/**
 * Verifies a JSON Web Token.
 * @param {string} token - The JWT to verify.
 * @returns {object|null} The decoded payload if the token is valid, otherwise null.
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    // Token is invalid (expired, malformed, etc.)
    return null;
  }
};
