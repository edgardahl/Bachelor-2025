// models/Notification.js – Håndterer all databasekommunikasjon for varsler i systemet (f.eks. når vakter publiseres eller tas)

import { supabase } from "../config/supabaseClient.js";
import { v4 as uuidv4 } from 'uuid';

// Henter alle varsler for en spesifikk bruker, sortert nyeste først (brukt i getNotificationByUserIdController)
export const getNotificationByUserIdModel = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("receiver_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  } catch (err) {
    console.error("Error fetching notifications:", err);
    throw new Error("Could not fetch notifications.");
  }
};

// Oppdaterer status til "opened" for et spesifikt varsel for en bruker (brukt i updateNotificationStatusController)
export const updateNotificationStatusModel = async (notificationId, userId) => {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ status: 'opened' })
      .eq("notification_id", notificationId)
      .eq("receiver_id", userId);

    if (error) throw new Error(error.message);

    const { data, error: fetchError } = await supabase
      .from("notifications")
      .select("*")
      .eq("notification_id", notificationId)
      .eq("receiver_id", userId)
      .single();

    if (fetchError) throw new Error(fetchError.message);

    return data;
  } catch (err) {
    console.error("Error updating notification status:", err);
    throw new Error("Could not update notification status.");
  }
};

// Sender varsler til kvalifiserte ansatte når en ny vakt publiseres (brukt i createShiftController)
export const newShiftPublishedNotificationModel = async (shiftData) => {
  const { store_id, qualifications, title, date, start_time, end_time, shift_id } = shiftData;

  try {
    const { data: storeData, error: storeError } = await supabase
      .from("stores")
      .select("municipality_id, name")
      .eq("store_id", store_id)
      .single();

    if (storeError || !storeData) throw new Error("Store not found");

    const storeMunicipalityId = storeData.municipality_id;
    const storeName = storeData.name;

    const requiredQualifications = Array.isArray(qualifications) && qualifications.length > 0 ? qualifications : [];

    const { data: qualifiedUsers, error: userError } = await supabase.rpc("find_qualified_users_for_shift", {
      required_qualifications: requiredQualifications,
      municipality_id: storeMunicipalityId,
    });

    if (userError) throw userError;

    const notifications = qualifiedUsers.map((user) => ({
      notification_id: uuidv4(),
      receiver_id: user.user_id,
      title: `Ny vakt: ${title}`,
      message: `En ny vakt er publisert for ${storeName} den ${date} kl. ${start_time}–${end_time}`,
      status: "unopened",
      shift_id: shift_id,
    }));

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

// Varsler butikksjef når en ansatt tar en vakt (brukt i claimShiftController)
export const notifyStoreManagerOnShiftClaimedModel = async (shift_id, claimedByUserId) => {
  try {
    const { data: shiftData, error: shiftError } = await supabase
      .from('shifts')
      .select('posted_by, store_id, title')
      .eq('shift_id', shift_id)
      .single();

    if (shiftError || !shiftData) throw new Error("Shift not found");

    const { posted_by, store_id, title: shiftTitle } = shiftData;

    const { data: storeManagerData, error: managerError } = await supabase
      .from('users')
      .select('user_id, role')
      .eq('user_id', posted_by)
      .eq('role', 'store_manager')
      .eq('store_id', store_id)
      .single();

    if (managerError || !storeManagerData) throw new Error("Store manager not found for this store");

    const { data: claimedByData, error: claimedByError } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('user_id', claimedByUserId)
      .single();

    if (claimedByError || !claimedByData) throw new Error("Claimed user not found");

    const { first_name: claimedByFirstName, last_name: claimedByLastName } = claimedByData;

    const notification = {
      notification_id: uuidv4(),
      receiver_id: storeManagerData.user_id,
      title: `Vakten du publiserte er nå tatt`,
      message: `${claimedByFirstName} ${claimedByLastName} har tatt vakten: "${shiftTitle}".`,
      status: 'unopened',
      shift_id: shift_id
    };

    const { error: insertError } = await supabase
      .from('notifications')
      .insert([notification]);

    if (insertError) throw new Error(insertError.message);

    return notification;
  } catch (err) {
    console.error("Error notifying store manager:", err);
    throw new Error("Could not notify store manager.");
  }
};

// Sletter et spesifikt varsel basert på ID (brukt i deleteNotificationController)
export const deleteNotificationByIdModel = async (notificationId) => {
  try {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("notification_id", notificationId);

    if (error) throw new Error(error.message);

    return true;
  } catch (err) {
    console.error("Error deleting notification:", err);
    throw new Error("Kunne ikke slette varselet.");
  }
};
