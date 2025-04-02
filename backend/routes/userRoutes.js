import express from 'express';
import {
  getAllUsersController,
  getUserByIdController,
  getEmployeesByStoreIdController
} from '../controllers/userController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route to get all users (public access)
router.get('/', getAllUsersController);

// Route to get employees for a store manager (protected by verifyToken and authorizeRoles)
router.get('/employees', verifyToken, authorizeRoles('store_manager'), getEmployeesByStoreIdController);

// Route to get a user by ID (public access)
router.get('/:id', getUserByIdController);

export default router;
