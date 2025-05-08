import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getNotificationByUserIdController,
  updateNotificationStatusController,
  deleteNotificationController,
} from "../controllers/notificationController.js";

const router = express.Router();

// Henter alle varsler for en bruker
router.get("/user", verifyToken, getNotificationByUserIdController);

// Oppdaterer status på et varsel til 'åpnet'
router.put("/status/update", verifyToken, updateNotificationStatusController);

// Sletter et varsel
router.delete(
  "/delete/:notificationId",
  verifyToken,
  deleteNotificationController
);

export default router;
