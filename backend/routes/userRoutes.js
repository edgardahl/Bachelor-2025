import express from 'express';
import {
  getAllUsersController,
  getUserByIdController,
  getEmployeesByStoreIdController,
  getEmployeesQualificationsController
} from '../controllers/userController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route to get all users (public access)
router.get('/', getAllUsersController);

// Route to get employees for a store manager (protected by verifyToken and authorizeRoles)
router.get('/myemployees', verifyToken, authorizeRoles('store_manager'), getEmployeesByStoreIdController);

// Route to get a user by ID (public access)
router.get('/:id', getUserByIdController);

// Route to get qualifications for multiple users (POST request)
router.post("/myemployees/qualifications", verifyToken, getEmployeesQualificationsController);

export default router;
