import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// 🔐 Generates a short-lived access token (15 minutes)
// This token is meant for client-side usage, such as in Authorization headers.
// Example: Authorization: Bearer <accessToken>
// It contains user ID and role for authorization checks and is sent on every protected API request.
const generateAccessToken = (user) => {
  return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
};

// 🔁 Generates a long-lived refresh token (7 days)
// Stored in an HTTP-only cookie on the client.
// Used to obtain a new access token when it expires without needing to log in again.
const generateRefreshToken = (user) => {
  return jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
};

// Login and issue tokens
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const isProduction = process.env.NODE_ENV === 'production';

    // Send refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/api/auth/refresh-token',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...userInfo } = user.toObject();
    res.json({ accessToken, user: userInfo });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 🔄 Controller: Refresh access token using refresh token
// Called when the access token expires (e.g., via Axios interceptor).
// Validates the refresh token from cookie, and issues a new access token.
// Client stores and uses the new access token to continue authenticated requests.
export const refreshAccessToken = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: 'Missing refresh token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    res.json({ accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(403).json({ error: 'Invalid refresh token' });
  }
};

// 👤 Controller: Get current logged-in user using access token
// Useful for frontend to fetch the current user on page load (e.g., /auth/me).
// Validates access token from Authorization header and returns the user (excluding password).
// Example request: GET /api/auth/me with header Authorization: Bearer <accessToken>
export const getCurrentUser = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Logout: clear refresh token
export const logoutUser = (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth/refresh-token',
  });
  res.json({ message: 'Logged out successfully' });
};
