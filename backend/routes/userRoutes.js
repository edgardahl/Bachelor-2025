import express from "express";
import {
  getAllUsersController,
  getUserByIdController,
  updateUserByIdController,
  getEmployeesByStoreIdController,
  getAvailableEmployeesController,
  updateEmployeeQualificationsController,
  changePassword,
  getAllStoreManagersController,
  getStoreManagersController,
  deleteUserByIdController, 
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

// Oppdaterer kvalifikasjoner for en ansatt
router.post(
  "/employees/qualifications/update",
  verifyToken,
  authorizeRoles("store_manager"),
  updateEmployeeQualificationsController
);

// Hent alle store managers (uavhengig om de har butikk eller ikke)
router.get(
  "/store_managers",
  verifyToken,
  authorizeRoles("admin"),
  getAllStoreManagersController
);

// Henter alle tilgjengelige ansatte
router.get(
  "/available",
  verifyToken,
  authorizeRoles("store_manager"),
  getAvailableEmployeesController
);

// Henter alle managers for en spesifikk butikk
router.get("/store_managers/:storeId", verifyToken, getStoreManagersController);

// Henter en bruker med en bestemt id
router.get("/:id", verifyToken, getUserByIdController);

// Sletter en bruker (egen, ansatt, eller butikksjef)
router.delete("/:id", verifyToken, deleteUserByIdController); // ✅ added

// Oppdaterer innloggede bruker
router.put("/current/update", verifyToken, updateUserByIdController);

// Oppdaterer passord for innloggede bruker
router.patch("/current/password", verifyToken, changePassword);

export default router;
