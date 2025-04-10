import express from "express";
import {
  getAllShiftsController,
  getShiftsUserIsQualifiedForController,
  getShiftsByStoreController,
  getShiftByIdController,
  getClaimedShiftsByUserController,
  claimShiftController,
  createShiftController,
  deleteShiftController,
  getShiftByPostedByController,
  getPreferredQualifiedShiftsController,
  getRequestedQualifiedShiftsController,
} from "../controllers/shiftController.js";

import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route to get all shifts
router.get("/", getAllShiftsController);

// Route to get all shifts a user is qualified for
router.get(
  "/user_is_qualified_for/:userId",
  verifyToken,
  getShiftsUserIsQualifiedForController
);

// ✅ Get shifts in the user's preferred municipalities
router.get(
  "/qualified/preferred",
  verifyToken,
  authorizeRoles("employee"),
  getPreferredQualifiedShiftsController
);

// ✅ Get shifts in a user-requested municipality
router.get(
  "/qualified/requested/:municipality_id",
  verifyToken,
  authorizeRoles("employee"),
  getRequestedQualifiedShiftsController
);

// Route to get claimed shifts by user ID
router.get(
  "/claimedByCurrentUser",
  verifyToken,
  getClaimedShiftsByUserController
);

// Route to get all shifts from a store
router.get("/store/:store_id", verifyToken, getShiftsByStoreController);

// Route to get all shifts posted by a specific user
router.get("/posted_by/:posted_by", getShiftByPostedByController);

// Route to get a single shift by ID
router.get("/:shift_id", getShiftByIdController);

// Route to claim a shift
router.post(
  "/claim/:shift_id",
  verifyToken,
  authorizeRoles("employee"),
  claimShiftController
);

// Route to create a new shift
router.post(
  "/",
  verifyToken,
  authorizeRoles("store_manager"),
  createShiftController
);

// Route to delete a shift
router.delete(
  "/deleteShiftById",
  verifyToken,
  authorizeRoles("store_manager"),
  deleteShiftController
);

export default router;
