// models/Notification.js

import { supabase } from "../config/supabaseClient.js"; // Import Supabase client

// Get notifications by user ID
export const getNotificationByUserIdModel = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("receiver_id", userId) // Filter by user ID
      .order("created_at", { ascending: false }); // Order notifications by created_at (latest first)
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data; // Return the fetched notifications
  } catch (err) {
    console.error("Error fetching notifications:", err);
    throw new Error("Could not fetch notifications.");
  }
};

export const updateNotificationStatusModel = async (notificationId, userId) => {
    console.log("Notification ID:", notificationId); // Log the notification ID for debugging
    console.log("User ID:", userId); // Log the user ID for debugging
    try {
      // Perform the update operation
      const { error } = await supabase
        .from("notifications")
        .update({ status: 'opened' }) // Update the notification's status to 'opened'
        .eq("notification_id", notificationId)
        .eq("receiver_id", userId); // Ensure it’s the correct user’s notification

      if (error) {
        throw new Error(error.message);
      }

      // Fetch the updated notification
      const { data, error: fetchError } = await supabase
        .from("notifications")
        .select("*")
        .eq("notification_id", notificationId)
        .eq("receiver_id", userId) // Ensure it’s the correct user’s notification
        .single(); // Fetch a single notification

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      console.log("Updated Notification:", data); // Log the updated notification

      return data; // Return the updated notification data
    } catch (err) {
      console.error("Error updating notification status:", err);
      throw new Error("Could not update notification status.");
    }
};
