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

// Logger inn en bruker og returnerer access + refresh token (brukt i login)
router.post("/login", loginUser);

// Logger ut en bruker ved å fjerne refresh-token-cookie (brukt i logout)
router.post("/logout", logoutUser);

// Fornyer access-token ved hjelp av refresh-token-cookie (brukt i authContext/axiosInstance)
router.post("/refresh-token", refreshAccessToken);

// Registrerer ny ansatt – kun tilgjengelig for innloggede butikksjefer
// Krever både gyldig access-token (verifyToken) og rolle som butikksjef (authorizeRoles)
router.post(
  "/employee/register",
  verifyToken,
  authorizeRoles("store_manager"),
  registerNewEmployeeController
);

// Registrerer ny butikksjef – kun for admin (brukt i admin-dashboard via NewManagerPage)
router.post(
  "/store_manager/register",
  verifyToken,
  authorizeRoles("store_manager"),
  registerNewManagerController
);

// Returnerer informasjon om den innloggede brukeren basert på access-token (brukt i AuthProvider)
router.get("/me", verifyToken, getCurrentUser);

export default router;
