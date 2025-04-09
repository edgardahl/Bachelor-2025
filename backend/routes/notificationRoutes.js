// routes/notificationRoutes.js

import express from "express";
import { verifyToken } from '../middleware/authMiddleware.js'; // Assuming you have auth middleware
import { 
    getNotificationByUserIdController, 
    updateNotificationStatusController 
} from "../controllers/notificationController.js";

const router = express.Router();

// Route to get all notifications for a specific user
router.get("/getNotificationByUserId", verifyToken, getNotificationByUserIdController);

// Route to update the status of a notification to 'opened'
router.put("/updateNotificationStatus", verifyToken, updateNotificationStatusController);


export default router;
