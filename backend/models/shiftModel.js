import { supabase } from "../config/supabaseClient.js";

// Get all shifts a user is qualified for
export const getShiftsUserIsQualifiedForModel = async (userId) => {
  const { data, error } = await supabase
    .rpc("get_shifts_user_is_qualified_for", { user_id: userId });  // Passing user_id as parameter

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
