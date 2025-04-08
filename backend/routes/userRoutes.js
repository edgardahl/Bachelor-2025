import express from "express";
import {
  getAllUsersController,
  getUserByIdController,
  updateUserByIdController,
  getEmployeesByStoreIdController,
  getEmployeesQualificationsController,
  updateEmployeeQualificationsController,
  changePassword,
} from "../controllers/userController.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Get all users (protected)
router.get("/", verifyToken, getAllUsersController);

// ✅ Get employees for a store manager
router.get(
  "/myemployees",
  verifyToken,
  authorizeRoles("store_manager"),
  getEmployeesByStoreIdController
);

// ✅ Fetch qualifications for multiple employees
router.post(
  "/myemployees/qualifications/fetch",
  verifyToken,
  authorizeRoles("store_manager"),
  getEmployeesQualificationsController
);

// ✅ Update qualifications for a specific employee
router.post(
  "/myemployees/qualifications/update",
  verifyToken,
  authorizeRoles("store_manager"),
  updateEmployeeQualificationsController
);

// ✅ Get a specific user by ID
router.get("/:id", verifyToken, getUserByIdController);

// ✅ Update user info by ID
router.put("/updateCurrentUser", verifyToken, updateUserByIdController);

// ✅ Update own password
router.patch("/me/password", verifyToken, changePassword);

export default router;
