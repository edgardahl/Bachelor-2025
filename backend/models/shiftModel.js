import { supabase } from "../config/supabaseClient.js";
import { sanitizeShift } from "../utils/sanitizeInput.js";

// Henter alle vakter fra en spesifikk butikk (brukt i getShiftsByStoreController)
export const getShiftsByStoreModel = async (storeId) => {
  const { data, error } = await supabase.rpc("get_shifts_by_store", {
    p_store_id: storeId,
  });
  if (error) throw new Error(`Supabase Error: ${error.message}`);
  return data;
};

// Henter én vakt basert på ID (brukt i getShiftByIdController)
export const getShiftByIdModel = async (shiftId) => {
  const { data, error } = await supabase.rpc("get_shift_by_id", {
    p_shift_id: shiftId,
  });
  if (error) throw new Error(error.message);
  return data;
};

// Henter alle vakter publisert av en bruker (brukt i getShiftByPostedByController)
export const getShiftByPostedByModel = async (postedById) => {
  const { data, error } = await supabase.rpc("get_shifts_by_posted_by", {
    p_posted_by: postedById,
  });
  if (error) throw new Error(error.message);
  return data;
};

// Henter alle vakter som er tatt av en spesifikk bruker (brukt i getClaimedShiftsByUserController)
export const getClaimedShiftsByUserModel = async (claimedById) => {
  const { data, error } = await supabase.rpc("get_claimed_shifts_by_user", {
    p_claimed_by: claimedById,
  });
  if (error) throw new Error(error.message);
  return data;
};

// Lar en ansatt ta en ledig vakt (brukt i claimShiftController)
export const claimShiftModel = async (shiftId, userId) => {
  // Sørger for at vakten kun kan tas dersom den ikke allerede er tatt
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

// Oppretter en ny vakt og lagrer tilknyttede kvalifikasjoner (brukt i createShiftController)
export const createShiftModel = async (shiftData) => {
  const sanitizedData = sanitizeShift(shiftData);

  // Beregner når vakten skal slettes automatisk (24 timer etter sluttid)
  const deleteAt = new Date(sanitizedData.date + " " + sanitizedData.end_time);
  deleteAt.setHours(deleteAt.getHours() + 24);

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
        delete_at: deleteAt.toISOString(),
      },
    ])
    .select()
    .single();

  if (shiftError) throw new Error(shiftError.message);

  // Setter inn alle kvalifikasjoner i koblingstabellen 'shift_qualifications'
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

// Sletter en vakt fra databasen (brukt i deleteShiftController)
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

// Henter alle vakter brukeren er kvalifisert for (brukt i getShiftsUserIsQualifiedForController)
export const getShiftsUserIsQualifiedForModel = async (userId) => {
  const { data, error } = await supabase.rpc(
    "get_shifts_user_is_qualified_for",
    {
      p_user_id: userId,
    }
  );

  if (error) throw new Error(error.message);
  return data;
};

// Henter vakter i foretrukne kommuner brukeren er kvalifisert for (brukt i getPreferredQualifiedShiftsController)
export const getPreferredQualifiedShiftsModel = async (userId) => {
  const { data, error } = await supabase.rpc(
    "get_qualified_shifts_preferred_municipality",
    {
      p_user_id: userId,
    }
  );
  if (error) throw new Error(error.message);
  return data;
};