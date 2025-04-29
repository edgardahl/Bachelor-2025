import express from 'express';
import {
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshAccessToken,
  registerUser,
  registerNewEmployeeController
} from '../controllers/authController.js';

import { verifyToken } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// 🔑 Auth-related routes
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refresh-token', refreshAccessToken);
router.post('/register', registerUser);
router.post('/registerNewEmployee', verifyToken, registerNewEmployeeController);

// 👤 User session & profile
router.get('/me', verifyToken, getCurrentUser);

export default router;
