import express from "express";
import {
  getAllShiftsController,
  getShiftsUserIsQualifiedForController,
  getShiftsByStoreController,
  getShiftByIdController,
  getClaimedShiftsController,
  createShiftController,
  deleteShiftController,
} from "../controllers/shiftController.js";

const router = express.Router();

// Route to get all shifts
router.get("/", getAllShiftsController);
// Route to get all shifts a user is qualified for
router.get(
  "/user_is_qualified_for/:user_id",
  getShiftsUserIsQualifiedForController
);
// Route to get all shifts from a store
router.get("/store/:store_id", getShiftsByStoreController);
// Route to get a single shift by ID
router.get("/:shift_id", getShiftByIdController);
// Route to get all claimed shifts
router.get("/claimed", getClaimedShiftsController);
// Route to create a new shift
router.post("/", createShiftController);
// Route to delete a shift
router.delete("/:shift_id", deleteShiftController);

export default router;
