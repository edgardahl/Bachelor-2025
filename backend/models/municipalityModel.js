import { supabase } from "../config/supabaseClient.js";

// Henter alle kommuner og sorterer dem alfabetisk (brukt i getAllMunicipalitiesController)
export const getAllMunicipalitiesModel = async () => {
  const { data, error } = await supabase
    .from("municipality")
    .select("municipality_id, municipality_name");

  if (error) {
    throw new Error(error.message);
  }

  // Sorterer kommunenavn etter norsk alfabetisk rekkefølge
  data.sort((a, b) =>
    a.municipality_name.localeCompare(b.municipality_name, "no", {
      sensitivity: "base",
    })
  );

  return data;
};
