import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authMiddleware.js";

import {
  getAllStoresController,
  getStoreByIdController,
  getStoresWithMunicipalityController,
  createStoreController,
  getAllStoresWithInfoController,
} from "../controllers/storeController.js";

const router = express.Router();

// Henter alle butikker med tilhørende kommune
router.get(
  "/storesWithMunicipality",
  verifyToken,
  getStoresWithMunicipalityController
);

// Henter alle butikker
router.get("/", verifyToken, getAllStoresController);

// Henter alle butikker med tilhørende informasjon
router.get("/getAllStoresWithInfo", getAllStoresWithInfoController);

// Henter en butikk med en bestemt id
router.get("/:storeId", getStoreByIdController);

// Oppretter en ny butikk
router.post(
  "/createNewStore",
  verifyToken,
  authorizeRoles("store_manager"), // Må oppdateres til admin
  createStoreController
);

export default router;
