import express from 'express';
import {
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshAccessToken,
  updateOwnProfile,
} from '../controllers/authController.js';

import { verifyToken } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// 🔑 Auth-related routes
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refresh-token', refreshAccessToken);

// 👤 User session & profile
router.get('/me', getCurrentUser);
router.put('/me', verifyToken, updateOwnProfile); // ✅ Allow logged-in users to update their own profile

export default router;
