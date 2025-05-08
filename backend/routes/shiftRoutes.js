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

// Henter alle skift
router.get("/", getAllShiftsController);

// Henter alle skift som brukeren er kvalifisert for
router.get(
  "/userIsQualifiedFor",
  verifyToken,
  getShiftsUserIsQualifiedForController
);

// Henter alle skift brukeren er kvalifisert for og i foretrukket kommune
router.get(
  "/qualified/preferred",
  verifyToken,
  authorizeRoles("employee"),
  getPreferredQualifiedShiftsController
);

// Henter alle skift som brukeren har bedt om
router.get(
  "/qualified/requested/:municipality_id",
  verifyToken,
  authorizeRoles("employee"),
  getRequestedQualifiedShiftsController
);

// Henter alle skift som brukeren tatt
router.get(
  "/claimedByCurrentUser",
  verifyToken,
  getClaimedShiftsByUserController
);

// Henter alle skift i en bestemt butikk
router.get("/store/:store_id", verifyToken, getShiftsByStoreController);

// Henter alle skift i en butikk som er publisert av en bestemt bruker
router.get("/posted_by/:posted_by", getShiftByPostedByController);

// Henter et skift med en bestemt id
router.get("/:shift_id", getShiftByIdController);

// Route for å ta et skift
router.post(
  "/claim/:shift_id",
  verifyToken,
  authorizeRoles("employee"),
  claimShiftController
);

// Oppretter et nytt skift
router.post(
  "/",
  verifyToken,
  authorizeRoles("store_manager"),
  createShiftController
);

// Sletter et skift
router.delete(
  "/deleteShiftById",
  verifyToken,
  authorizeRoles("store_manager"),
  deleteShiftController
);

export default router;
