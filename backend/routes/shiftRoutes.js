import express from "express";
import { getShiftsUserIsQualifiedForController } from "../controllers/shiftController.js";

const router = express.Router();

// Route to get all shifts a user is qualified for
router.get("/user_is_qualified_for/:user_id", getShiftsUserIsQualifiedForController);  // Fixed route path

export default router;
