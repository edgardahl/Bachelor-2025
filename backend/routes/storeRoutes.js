import express from "express";
import { getAllStoresController, getStoreByIdController } from "../controllers/storeController.js";

const router = express.Router();

// Route to get all stores
router.get("/", getAllStoresController);

// Route to get a single store by ID
router.get("/:storeId", getStoreByIdController);

export default router;
