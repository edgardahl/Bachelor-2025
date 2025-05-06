// models/Notification.js

import { supabase } from "../config/supabaseClient.js"; // Import Supabase client
import { v4 as uuidv4 } from 'uuid';


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


export const newShiftPublishedNotificationModel = async (shiftData) => {
    const { store_id, qualifications, title, date, start_time, end_time, shift_id } = shiftData;

  
    console.log("Shift Data for Notification:", shiftData);
    try {
      // Step 1: Get municipality of the store
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("municipality_id, name")
        .eq("store_id", store_id)
        .single();
  
      if (storeError || !storeData) throw new Error("Store not found");
  
      const storeMunicipalityId = storeData.municipality_id;
      const storeName = storeData.name;
      console.log("Store That published shift:", storeName, storeMunicipalityId);
  
      // Step 2: Get users who:
      // - are employees
      // - have this municipality in `user_municipality`
      // - have all required qualifications
      console.log("Qualifications needed for shift:", qualifications);
      const { data: qualifiedUsers, error: userError } = await supabase.rpc("find_qualified_users_for_shift", {
        required_qualifications: qualifications,
        municipality_id: storeMunicipalityId,
      });
        console.log("Qualified Users for ", storeName, "´s shift is " , qualifiedUsers);
  
      if (userError) throw userError;
  
      // Step 3: Create notifications for each user
      const notifications = qualifiedUsers.map((user) => ({
        notification_id: uuidv4(),
        receiver_id: user.user_id,
        title: `Ny vakt: ${title}`,
        message: `En ny vakt er publisert for ${storeName} den ${date} kl. ${start_time}–${end_time}`,
        status: "Uåpnet",
        shift_id: shift_id, // 👈 Add this line
      }));      
        console.log("Notifications to be inserted:", notifications);
  
      const { error: insertError } = await supabase
        .from("notifications")
        .insert(notifications);
  
      if (insertError) throw insertError;
  
      return notifications;
    } catch (err) {
      console.error("Error creating shift notifications:", err);
      throw new Error("Kunne ikke sende varsler for ny vakt.");
    }
  };



  // Notification to store manager when a shift is claimed
export const notifyStoreManagerOnShiftClaimedModel = async (shift_id, claimedByUserId) => {
    try {
      // Step 1: Fetch the shift details to get the 'posted_by' (store manager) and the store_id
      const { data: shiftData, error: shiftError } = await supabase
        .from('shifts')
        .select('posted_by, store_id, title')
        .eq('shift_id', shift_id)
        .single();
      
      if (shiftError || !shiftData) {
        throw new Error("Shift not found");
      }
  
      const { posted_by, store_id, title: shiftTitle } = shiftData;
  
      // Step 2: Check if the user who posted the shift is a store manager
      const { data: storeManagerData, error: managerError } = await supabase
        .from('users')
        .select('user_id, role')
        .eq('user_id', posted_by)
        .eq('role', 'store_manager')
        .eq('store_id', store_id)
        .single();
  
      if (managerError || !storeManagerData) {
        throw new Error("Store manager not found for this store");
      }
  
      // Step 3: Fetch the name of the user who claimed the shift
      const { data: claimedByData, error: claimedByError } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('user_id', claimedByUserId)
        .single();
  
      if (claimedByError || !claimedByData) {
        throw new Error("Claimed user not found");
      }
  
      const { first_name: claimedByFirstName, last_name: claimedByLastName } = claimedByData;
  
      // Step 4: Create a dynamic notification for the store manager
      const notification = {
        notification_id: uuidv4(),
        receiver_id: storeManagerData.user_id, // Store manager's ID
        title: `Vakten du publiserte er nå tatt`,
        message: `${claimedByFirstName} ${claimedByLastName} har tatt vakten: "${shiftTitle}".`,
        status: 'Uåpnet',
        shift_id: shift_id
      };
  
      // Step 5: Insert the notification into the 'notifications' table
      const { error: insertError } = await supabase
        .from('notifications')
        .insert([notification]);
  
      if (insertError) {
        throw new Error(insertError.message);
      }
  
      console.log("Notification sent to store manager:", storeManagerData.user_id);
      return notification;
    } catch (err) {
      console.error("Error notifying store manager:", err);
      throw new Error("Could not notify store manager.");
    }
  };
  
  // Delete a notification by ID
export const deleteNotificationByIdModel = async (notificationId) => {
  try {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("notification_id", notificationId);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  } catch (err) {
    console.error("Error deleting notification:", err);
    throw new Error("Kunne ikke slette varselet.");
  }
};
