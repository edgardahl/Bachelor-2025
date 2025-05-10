import express from "express";
import {
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshAccessToken,
  registerNewEmployeeController,
  registerNewManagerController
} from "../controllers/authController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Håndterer innlogging og utlogging
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.post(
  "/employee/register",
  verifyToken,
  authorizeRoles("store_manager"), // Må oppdateres til admin
  registerNewEmployeeController
);

// Admin lager ny butikksjef
router.post("/store_manager/register", registerNewManagerController);

// Henter den innloggede brukeren
router.get("/me", verifyToken, getCurrentUser);

export default router;
