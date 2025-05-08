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

// Henter alle brukere
router.get("/", verifyToken, getAllUsersController);

// Henter alle ansatte for en butikk
router.get(
  "/employees",
  verifyToken,
  authorizeRoles("store_manager"),
  getEmployeesByStoreIdController
);

// Oppdatarer kvalifikasjoner for en ansatt
router.post(
  "/employees/qualifications/update",
  verifyToken,
  authorizeRoles("store_manager"),
  updateEmployeeQualificationsController
);

// Henter alle tilgjengelige ansatte
router.get(
  "/available",
  verifyToken,
  authorizeRoles("store_manager"),
  getAvailableEmployeesController
);

// Henter en bruker med en bestemt id
router.get("/:id", verifyToken, getUserByIdController);

// Henter innloggede bruker
router.put("/current/update", verifyToken, updateUserByIdController);

// Oppdaterer passord for innloggede bruker
router.patch("/current/password", verifyToken, changePassword);

export default router;
