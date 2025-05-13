import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getNotificationByUserIdController,
  updateNotificationStatusController,
  deleteNotificationController,
} from "../controllers/notificationController.js";

const router = express.Router();

// Henter alle varsler for innlogget bruker (brukt i NotificationDropdown.jsx)
router.get("/user", verifyToken, getNotificationByUserIdController);

// Oppdaterer statusen til et varsel til 'åpnet' (brukt i NotificationDropdown.jsx)
router.put("/status/update", verifyToken, updateNotificationStatusController);

// Sletter et spesifikt varsel basert på ID (brukt i NotificationDropdown.jsx)
router.delete(
  "/delete/:notificationId",
  verifyToken,
  deleteNotificationController
);

export default router;
