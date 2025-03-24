// userRoutes.js
import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';

import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🔐 Only store managers can see all users
router.get('/', verifyToken, authorizeRoles('store_manager'), getUsers);

// 🔐 Any logged-in user can fetch their own profile
router.get('/:id', verifyToken, getUser);

// 🔐 Registration can be public
router.post('/register', createUser);

// ✅ Allow store managers AND employees to update only their own profile
router.put('/:id', verifyToken, (req, res, next) => {
  if (req.user.userId !== req.params.id) {
    return res.status(403).json({ error: 'Forbidden: Cannot update other users' });
  }
  next();
}, updateUser);

// ❌ Delete user — keep this only for store managers
router.delete('/:id', verifyToken, authorizeRoles('store_manager'), deleteUser);

export default router;
