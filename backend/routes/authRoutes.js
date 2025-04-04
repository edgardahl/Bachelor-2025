import express from 'express';
import {
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshAccessToken,
  registerUser,
  changePassword, // ✅ New controller function
} from '../controllers/authController.js';

import { verifyToken } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// 🔑 Auth-related routes
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refresh-token', refreshAccessToken);
router.post('/register', registerUser);

// 👤 User session & profile
router.get('/me', verifyToken, getCurrentUser);

// 🔒 Update own password (authenticated users only)
router.patch('/me/password', verifyToken, changePassword); // ✅ New route

export default router;
