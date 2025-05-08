import express from "express";
import {
  getAllStoresController,
  getStoreByIdController,
  getStoresWithMunicipalityController,
  createStoreController,
  getAllStoresWithInfoController,
} from "../controllers/storeController.js";

const router = express.Router();

router.get("/storesWithMunicipality", getStoresWithMunicipalityController);

router.get("/", getAllStoresController);

router.get("/getAllStoresWithInfo", getAllStoresWithInfoController);

router.get("/:storeId", getStoreByIdController);

router.post("/createNewStore", createStoreController);

export default router;
