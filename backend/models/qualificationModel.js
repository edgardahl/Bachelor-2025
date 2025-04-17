import { supabase } from "../config/supabaseClient.js";

// Get all qualifications from the database
export const getAllQualificationsModel = async () => {
  const { data, error } = await supabase
    .from("qualification") // Name of the table
    .select("*"); // Select all columns (You can specify specific columns if needed)

  if (error) {
    throw new Error(error.message); // Throw an error if there's an issue
  }

  return data; // Return the qualifications
};

// get qualifications for a specific shift
export const getShiftQualificationsModel = async (shiftId) => {
  const { data, error } = await supabase
    .from("shift_qualifications")
    .select("qualification_id")
    .eq("shift_id", shiftId);

  if (error) {
    throw new Error(error.message);
  }

  return data; // Return the qualifications for the shift
};

export const deleteNotificationByIdModel = async (notificationId) => {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("notification_id", notificationId);

  if (error) {
    throw new Error("Kunne ikke slette varsel.");
  }

  return true;
};
