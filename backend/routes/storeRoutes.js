import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authMiddleware.js";

import {
  getAllStoresController,
  getStoreByIdController,
  getStoreWithInfoController,
  getStoresWithMunicipalityController,
  createStoreController,
  getAllStoresWithInfoController,
  updateStoreController,
  deleteStoreController
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

// Hent all informasjon om en butikk
router.get(
  "/getStoreWithInfo/:storeId",
  verifyToken,
  getStoreWithInfoController
);

// Henter en butikk med en bestemt id
router.get("/:storeId", getStoreByIdController);

// Oppretter en ny butikk
router.post(
  "/createNewStore",
  verifyToken,
  authorizeRoles("store_manager"), // Må oppdateres til admin
  createStoreController
);


// Update an existing store
router.put(
  "/:storeId", 
  verifyToken, 
  authorizeRoles("admin"), // You can adjust the role if needed
  updateStoreController
);


// Add the route to your routes file
router.delete("/:store_id",verifyToken, authorizeRoles("admin"), deleteStoreController);


export default router;
