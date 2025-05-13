import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";

import { getAllMunicipalitiesController } from "../controllers/municipalityController.js";

const router = express.Router();

// Henter alle kommuner fra databasen
router.get("/", verifyToken, getAllMunicipalitiesController);

export default router;
