import express from "express";
import {
  getAllStoresController,
  getStoreByIdController,
  getStoresWithMunicipalityController,
  createStoreController,
  getAllStoresWithInfoController,
} from "../controllers/storeController.js";

const router = express.Router();

// Route to get stores with municipality details
router.get("/storesWithMunicipality", getStoresWithMunicipalityController);

// Route to get all stores
router.get("/", getAllStoresController);

// Route to get all stores with additional information
router.get("/getAllStoresWithInfo", getAllStoresWithInfoController);

// Route to get a single store by ID
router.get("/:storeId", getStoreByIdController);

//Create a new store
router.post("/createNewStore", createStoreController);

export default router;
