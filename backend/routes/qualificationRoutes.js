import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getAllQualificationsController } from "../controllers/qualificationController.js";

const router = express.Router();

// Henter alle kvalifikasjoner (brukt i kvalifikasjonerFilter., CreateShift., Profile. og NewEmployeeForm.jsx)
router.get("/", verifyToken, getAllQualificationsController);

export default router;
