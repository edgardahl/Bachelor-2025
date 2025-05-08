import express from "express";
import {
  getAllStoresController,
  getStoreByIdController,
  getStoresWithMunicipalityController,
  createStoreController,
  getAllStoresWithInfoController,
} from "../controllers/storeController.js";

const router = express.Router();

// Henter alle butikker med tilhørende kommune
router.get("/storesWithMunicipality", getStoresWithMunicipalityController);

// Henter alle butikker
router.get("/", getAllStoresController);

// Henter alle butikker med tilhørende informasjon
router.get("/getAllStoresWithInfo", getAllStoresWithInfoController);

// Henter en butikk med en bestemt id
router.get("/:storeId", getStoreByIdController);

// Oppretter en ny butikk
router.post("/createNewStore", createStoreController);

export default router;
