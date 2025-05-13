import express from "express";
import {
  getShiftByIdController,
  getShiftsUserIsQualifiedForController,
  getShiftsByStoreController,
  getClaimedShiftsByUserController,
  getPreferredQualifiedShiftsController,
  getShiftByPostedByController,
  createShiftController,
  claimShiftController,
  deleteShiftController,
} from "../controllers/shiftController.js";

import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Henter alle skift ansatten er kvalifisert for (brukt i ansatt sin MineVakter.jsx)
router.get(
  "/userIsQualifiedFor",
  verifyToken,
  getShiftsUserIsQualifiedForController
);

// Henter kvalifiserte skift i ansattens foretrukne kommuner (brukt i ansatt sin Dashboard.jsx)
router.get(
  "/qualified/preferred",
  verifyToken,
  authorizeRoles("employee"),
  getPreferredQualifiedShiftsController
);

// Henter alle skift som er tatt av innlogget ansatt (brukt i ansatt sin MineVakter.jsx)
router.get(
  "/claimedByCurrentUser",
  verifyToken,
  getClaimedShiftsByUserController
);

// Henter alle skift i en bestemt butikk (brukt i begge sin Dashboard.jsx, Butikk.jsx, ShiftDetailsPage.jsx og butikksjef sin MineVakter.jsx )
router.get("/store/:store_id", verifyToken, getShiftsByStoreController);

// Henter alle skift som er publisert av en spesifikk butikksjef (brukt i butiksjef sin Dashboard.jsx og MineVakter.jsx)
router.get("/posted_by/:posted_by", verifyToken, getShiftByPostedByController);

// Henter detaljer om et spesifikt skift (brukt i ShiftDetailsPage.jsx)
router.get("/:shift_id", verifyToken, getShiftByIdController);

// Ansatt tar en ledig vakt (brukt i ShiftDetailsPage.jsx)
router.post(
  "/claim/:shift_id",
  verifyToken,
  authorizeRoles("employee"),
  claimShiftController
);

// Oppretter et nytt skift (brukt i CreateShift.jsx)
router.post(
  "/",
  verifyToken,
  authorizeRoles("store_manager"),
  createShiftController
);

// Sletter en vakt dersom innlogget butikksjef eier butikken vakten tilhører (brukt i ShiftDetailsPage.jsx)
router.delete(
  "/deleteShiftById",
  verifyToken,
  authorizeRoles("store_manager"),
  deleteShiftController
);

export default router;
