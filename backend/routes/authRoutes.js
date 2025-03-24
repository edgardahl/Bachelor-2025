import express from 'express';
import {
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshAccessToken
} from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', getCurrentUser);
router.post('/refresh-token', refreshAccessToken); 

export default router;
