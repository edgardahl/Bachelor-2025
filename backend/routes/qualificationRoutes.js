import express from "express";
import { getAllQualificationsController } from "../controllers/qualificationController.js";

const router = express.Router();

// Route to get all qualifications
router.get("/", getAllQualificationsController);

export default router;
