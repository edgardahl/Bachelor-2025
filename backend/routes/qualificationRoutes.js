import express from "express";
import { getAllQualificationsController } from "../controllers/qualificationController.js";

const router = express.Router();

// Henter alle kvalifikasjoner
router.get("/", getAllQualificationsController);

export default router;
