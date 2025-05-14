import { supabase } from "../config/supabaseClient.js";

// Henter alle kvalifikasjoner, sortert alfabetisk (brukt i f.eks. createEmployeeForm og Profile)
export const getAllQualificationsModel = async () => {
  const { data, error } = await supabase
    .from("qualification")
    .select("*");

  if (error) {
    throw new Error(error.message);
  }

  // Sorterer alfabetisk etter norske regler
  data.sort((a, b) =>
    a.name.localeCompare(b.name, "no", { sensitivity: "base" })
  );

  return data;
};

// Henter kvalifikasjoner knyttet til en spesifikk vakt (brukt i claimShiftController)
export const getShiftQualificationsModel = async (shiftId) => {
  const { data, error } = await supabase
    .from("shift_qualifications")
    .select("qualification_id")
    .eq("shift_id", shiftId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
