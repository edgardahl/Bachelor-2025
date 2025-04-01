// routes/userRoutes.js
import express from 'express';
import { getAllUsersController, getUserByIdController } from '../controllers/userController.js';

const router = express.Router();

// Route to get all users
router.get('/', getAllUsersController);

// Route to get a user by ID
router.get('/:id', getUserByIdController);


export default router;
