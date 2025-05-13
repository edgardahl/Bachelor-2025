import express from "express";
import {
  getUserByIdController,
  getEmployeesByStoreIdController,
  getAvailableEmployeesController,
  getAllStoreManagersController,
  getStoreManagersController,
  updateUserByIdController,
  updateEmployeeQualificationsController,
  changePassword,
  deleteUserByIdController,
} from "../controllers/userController.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Henter alle ansatte for en butikk (brukes i MineAnsatte.jsx og butikksjef sin Dashboard.jsx)
router.get(
  "/employees",
  verifyToken,
  authorizeRoles("store_manager"),
  getEmployeesByStoreIdController
);

// Henter alle tilgjengelige ansatte som ønsker å jobbe i en butikksjef sin kommune (brukes i LedigeAnsatte.jsx og butikksjef sin Dashboard.jsx)
router.get(
  "/available",
  verifyToken,
  authorizeRoles("store_manager"),
  getAvailableEmployeesController
);

// Henter alle butikksjefer (uavhengig av tilknytning til butikk) (brukes i NewStore.jsx og AdminButikker.jsx)
router.get(
  "/store_managers",
  verifyToken,
  authorizeRoles("admin"),
  getAllStoreManagersController
);

// Henter butikksjefer for en spesifikk butikk (brukes i AdminButikk, AdminManagers, admin Dashboard og NewStore.jsx)
router.get("/store_managers/:storeId", verifyToken, getStoreManagersController);

// Henter en spesifikk bruker basert på ID (brukes i MineVakter, ButikkOversikt og Profile.jsx)
router.get("/:id", verifyToken, getUserByIdController);

// Oppdaterer kvalifikasjoner for en ansatt (brukes i Profile.jsx)
router.post(
  "/employees/qualifications/update",
  verifyToken,
  authorizeRoles("store_manager"),
  updateEmployeeQualificationsController
);

// Oppdaterer innlogget brukers informasjon (brukes i Profile.jsx)
router.put("/current/update", verifyToken, updateUserByIdController);

// Endrer passord for innlogget bruker (brukes i Profile.jsx)
router.patch("/current/password", verifyToken, changePassword);

// Sletter en bruker (egen, ansatt eller butikksjef) (brukes i Profile.jsx)
router.delete("/:id", verifyToken, deleteUserByIdController);

export default router;
