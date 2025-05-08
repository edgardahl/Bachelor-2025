import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getNotificationByUserIdController,
  updateNotificationStatusController,
  deleteNotificationController,
} from "../controllers/notificationController.js";

const router = express.Router();

// Hent alle varsler for en bruker
router.get("/user", verifyToken, getNotificationByUserIdController);

// Oppdater status på et varsel til 'åpnet'
router.put("/status/update", verifyToken, updateNotificationStatusController);

// ✅ Slett et varsel
router.delete(
  "/delete/:notificationId",
  verifyToken,
  deleteNotificationController
);

export default router;
