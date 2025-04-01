import express from "express";
import {
  getAllQualificationsController,
  assignQualificationsToShift,
  assignQualificationsController,
} from "../controllers/qualificationController.js";

const router = express.Router();

// Route to get all qualifications
router.get("/", getAllQualificationsController);
// Route to assign qualifications to a shift
router.post("/assign", assignQualificationsToShift);
// Route to assign qualifications separately
router.post("/assign-separately", assignQualificationsController);

export default router;
