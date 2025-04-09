// controllers/notificationController.js

import { 
    getNotificationByUserIdModel, 
    updateNotificationStatusModel  } 
    from "../models/notificationModel.js";

// Get all notifications for a user
export const getNotificationByUserIdController = async (req, res) => {
  const userId = req.user.userId; // Extract user ID from the request object
  console.log("User ID:", userId); // Log the user ID for debugging
  
  try {
    // Get notifications from the model
    const notifications = await getNotificationByUserIdModel(userId);
    
    if (notifications.length === 0) {
      return res.status(200).json({ message: "No notifications found." });
    }
    
    // Return notifications as a response
    return res.status(200).json(notifications);
  } catch (err) {
    console.error("Error in notification controller:", err);
    return res.status(500).json({ message: "Error fetching notifications." });
  }
};


// Controller to update the status of a notification
export const updateNotificationStatusController = async (req, res) => {
    const { notificationId, userId } = req.body; // Get notification ID and user ID from request
    
    try {
      // Update the notification's status to 'opened'
      const updatedNotification = await updateNotificationStatusModel(notificationId, userId);
  
      if (!updatedNotification) {
        return res.status(404).json({ message: "Notification not found." });
      }
      
      return res.status(200).json({ message: "Notification status updated to 'opened'." });
    } catch (err) {
      console.error("Error in updating notification status:", err);
      return res.status(500).json({ message: "Could not update notification status." });
    }
  };