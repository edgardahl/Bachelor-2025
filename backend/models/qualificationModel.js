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

export const getShiftQualificationsModel = async (shiftId) => {
  const { data, error } = await supabase
    .from("shift_qualifications")
    .select("qualification_id")
    .eq("shift_id", shiftId); // Get all qualifications for the shift

  if (error) {
    throw new Error(error.message);
  }

  return data; // Return the qualifications for the shift
};
