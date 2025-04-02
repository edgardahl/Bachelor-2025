/**
 * 🔐 generateTokens.js
 * 
 * Utility functions to generate JWT tokens used in authentication.
 * 
 * - `generateAccessToken(user)`: Creates a short-lived access token with user ID and role.
 *   This token is used on every API request for authorization (15 min expiry).
 *
 * - `generateRefreshToken(user)`: Creates a long-lived refresh token (7 days).
 *   Stored in an HTTP-only cookie, it's used to issue new access tokens when the old one expires.
 *
 * Keeping token logic here helps reduce duplication and centralizes JWT behavior.
 */

import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) => {
    return jwt.sign(
      { userId: user.userId, role: user.role }, // ✅ fixed key
      process.env.JWT_SECRET,
      { expiresIn: '20s' } // shorter is better for access tokens
    );
  };
  
  export const generateRefreshToken = (user) => {
    return jwt.sign(
      { userId: user.userId }, // ✅ fixed key
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
  };
  
