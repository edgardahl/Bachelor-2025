import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authMiddleware.js";

import {
  getAllStoresController,
  getAllStoresWithInfoController,
  getStoreWithInfoController,
  getStoresWithMunicipalityController,
  getStoreByIdController,
  createStoreController,
  updateStoreController,
  deleteStoreController,
} from "../controllers/storeController.js";

const router = express.Router();

// Henter alle butikker (brukes i NewManagerPages.jsx)
router.get("/", verifyToken, getAllStoresController);

// Henter alle butikker med utvidet informasjon, inkludert kjede og kommune (brukes i CoopMap.jsx)
router.get(
  "/getAllStoresWithInfo",
  verifyToken,
  getAllStoresWithInfoController
);

// Henter alle butikker med tilhørende kommune (brukes i ButikkFilter, Butikkoversikt, Profile og i alle Dashboard.jsx)
router.get(
  "/storesWithMunicipality",
  verifyToken,
  getStoresWithMunicipalityController
);

// Henter detaljert informasjon om en butikk (brukes i AdminButikk.jsx)
router.get(
  "/getStoreWithInfo/:storeId",
  verifyToken,
  getStoreWithInfoController
);

// Henter en butikk basert på ID (brukes i Butikk.jsx)
router.get("/:storeId", verifyToken, getStoreByIdController);

// Oppretter en ny butikk (brukes i NewStore.jsx)
router.post(
  "/createNewStore",
  verifyToken,
  authorizeRoles("admin"),
  createStoreController
);

// Oppdaterer en eksisterende butikk (brukes i AdminButikk.jsx)
router.put(
  "/:storeId",
  verifyToken,
  authorizeRoles("admin"),
  updateStoreController
);

// Sletter en butikk (brukes i AdminButikk.jsx)
router.delete(
  "/:store_id",
  verifyToken,
  authorizeRoles("admin"),
  deleteStoreController
);

export default router;
