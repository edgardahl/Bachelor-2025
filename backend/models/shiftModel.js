import { supabase } from "../config/supabaseClient.js";
// ✅ Named import
import { sanitizeShift } from "../utils/sanitizeInput.js";

// Get all shifts
export const getAllShiftsModel = async () => {
  const { data, error } = await supabase.rpc("get_all_shifts");

  if (error) throw new Error(`Supabase Error: ${error.message}`);
  return { data };
};

// Get all shifts from a store
export const getShiftsByStoreModel = async (storeId) => {
  const { data, error } = await supabase.rpc("get_shifts_by_store", {
    p_store_id: storeId,
  });
  if (error)
    throw new Error(`Supabase Error in claimShiftModel: ${error.message}`);
  return data;
};

// Get a single shift by ID
export const getShiftByIdModel = async (shiftId) => {
  const { data, error } = await supabase.rpc("get_shift_by_id", {
    p_shift_id: shiftId,
  });

  if (error) throw new Error(error.message);
  return data;
};

// Get all shifts posted by a specific user
export const getShiftByPostedByModel = async (postedById) => {
  const { data, error } = await supabase.rpc("get_shifts_by_posted_by", {
    p_posted_by: postedById,
  });

  if (error) throw new Error(error.message);
  return data;
};

// Get claimed shifts by user
export const getClaimedShiftsByUserModel = async (claimedById) => {
  const { data, error } = await supabase.rpc("get_claimed_shifts_by_user", {
    p_claimed_by: claimedById,
  });
  if (error) throw new Error(error.message);
  return data;
};

// Claim a shift
export const claimShiftModel = async (shiftId, userId) => {
  console.log("Claiming shift with ID:", shiftId);
  console.log("User ID:", userId);

  const { data, error } = await supabase
    .from("shifts")
    .update({ claimed_by_id: userId })
    .eq("shift_id", shiftId)
    .is("claimed_by_id", null)
    .select("shift_id, claimed_by_id")
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Create a new shift with qualifications
export const createShiftModel = async (shiftData) => {
  const sanitizedData = sanitizeShift(shiftData);

  // Calculate delete_at (24 hours after the shift end time)
  const deleteAt = new Date(sanitizedData.date + ' ' + sanitizedData.end_time); // Combine date and end_time
  deleteAt.setHours(deleteAt.getHours() + 24);  // Add 24 hours to the end time

  // Insert the shift into the database with the calculated delete_at value
  const { data: shiftDataResponse, error: shiftError } = await supabase
    .from("shifts")
    .insert([
      {
        title: sanitizedData.title,
        description: sanitizedData.description,
        date: sanitizedData.date,
        start_time: sanitizedData.start_time,
        end_time: sanitizedData.end_time,
        store_id: sanitizedData.store_id,
        posted_by: sanitizedData.posted_by,
        delete_at: deleteAt.toISOString(),  // Insert the calculated delete_at
      },
    ])
    .select()
    .single();

  if (shiftError) throw new Error(shiftError.message);

  // Insert qualifications into the 'shift_qualifications' table
  if (sanitizedData.qualifications.length > 0) {
    const qualificationInserts = sanitizedData.qualifications.map(
      async (qualificationId) => {
        const { error } = await supabase.from("shift_qualifications").insert([
          {
            shift_id: shiftDataResponse.shift_id,
            qualification_id: qualificationId,
          },
        ]);

        if (error) throw new Error(error.message);
      }
    );

    await Promise.all(qualificationInserts);
  }

  return shiftDataResponse;
};


// Delete a shift from the database
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
  console.log("userId", userId);
  const { data, error } = await supabase.rpc(
    "get_shifts_user_is_qualified_for",
    { p_user_id: userId }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
