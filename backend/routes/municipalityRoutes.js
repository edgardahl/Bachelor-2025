import express from "express";
import { getAllMunicipalitiesController } from "../controllers/municipalityController.js";

const router = express.Router();

// Route to get all municipalities
router.get("/", getAllMunicipalitiesController);

export default router;
