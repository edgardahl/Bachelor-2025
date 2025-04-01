import { supabase } from "../config/supabaseClient.js";
import sanitizeShift from "../utils/sanitizeInput.js";

// Get all shifts
export const getAllShiftsModel = async () => {
  const { data, error } = await supabase.from("shifts").select("*");

  if (error) throw new Error(error.message);
  return data;
};

// Get all shifts from a store
export const getShiftsByStoreModel = async (storeId) => {
  const { data, error } = await supabase
    .from("shifts")
    .select("*")
    .eq("store_id", storeId);

  if (error) throw new Error(error.message);
  return data;
};

// Get a single shift by ID
export const getShiftByIdModel = async (shiftId) => {
  const { data, error } = await supabase
    .from("shifts")
    .select("*")
    .eq("shift_id", shiftId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Get all claimed shifts
export const getClaimedShiftsModel = async () => {
  const { data, error } = await supabase
    .from("shifts")
    .select("*")
    .not("claimed_by_id", "is", null);

  if (error) throw new Error(error.message);
  return data;
};

// Claim a shift
export const claimShiftModel = async (shiftId, userId) => {
  const { data, error } = await supabase
    .from("shifts")
    .update({ claimed_by_id: userId })
    .eq("shift_id", shiftId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Create a new shift
export const createShiftModel = async (shiftData, userId) => {
  const sanitizedData = sanitizeShift(shiftData, userId);

  const { data, error } = await supabase
    .from("shifts")
    .insert([sanitizedData])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Delete a shift
export const deleteShiftModel = async (shiftId) => {
  const { data, error } = await supabase
    .from("shifts")
    .delete()
    .eq("shift_id", shiftId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Get all shifts a user is qualified for
export const getShiftsUserIsQualifiedForModel = async (userId) => {
  const { data, error } = await supabase.rpc(
    "get_shifts_user_is_qualified_for",
    { user_id: userId }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
