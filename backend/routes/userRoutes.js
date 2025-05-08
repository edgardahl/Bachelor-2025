import express from "express";
import {
  getAllUsersController,
  getUserByIdController,
  updateUserByIdController,
  getEmployeesByStoreIdController,
  getAvailableEmployeesController,
  updateEmployeeQualificationsController,
  changePassword,
} from "../controllers/userController.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getAllUsersController);

router.get(
  "/employees",
  verifyToken,
  authorizeRoles("store_manager"),
  getEmployeesByStoreIdController
);

router.post(
  "/employees/qualifications/update",
  verifyToken,
  authorizeRoles("store_manager"),
  updateEmployeeQualificationsController
);

router.get(
  "/available",
  verifyToken,
  authorizeRoles("store_manager"),
  getAvailableEmployeesController
);

router.get("/:id", verifyToken, getUserByIdController);

router.put("/current/update", verifyToken, updateUserByIdController);

router.patch("/current/password", verifyToken, changePassword);

export default router;
