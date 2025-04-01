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

// Create a new shift with qualifications
export const createShiftModel = async (shiftData, userId) => {
  const sanitizedData = sanitizeShift(shiftData, userId);

  // Insert the shift into the database
  const { data: shiftDataResponse, error: shiftError } = await supabase
    .from("shifts")
    .insert([sanitizedData])
    .select()
    .single();

  if (shiftError) throw new Error(shiftError.message);

  // Now, insert the qualifications needed for this shift into the 'shift_qualifications' table
  const qualificationPromises = shiftData.qualifications.map(
    async (qualificationId) => {
      const { error } = await supabase
        .from("shift_qualifications")
        .insert([
          {
            shift_id: shiftDataResponse.shift_id,
            qualification_id: qualificationId,
          },
        ]);

      if (error) throw new Error(error.message);
    }
  );

  // Wait for all qualifications to be inserted
  await Promise.all(qualificationPromises);

  return shiftDataResponse;
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
