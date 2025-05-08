import express from "express";
import { getAllMunicipalitiesController } from "../controllers/municipalityController.js";

const router = express.Router();

// Henter alle kommuner
router.get("/", getAllMunicipalitiesController);

export default router;
