// models/municipalityModel.js
import { supabase } from "../config/supabaseClient.js";

// Get all municipalities
export const getAllMunicipalitiesModel = async () => {
  const { data, error } = await supabase
    .from("municipality")
    .select("municipality_id, municipality_name");

  if (error) {
    throw new Error(error.message);
  }

  // Sort the municipalities based on the Norwegian alphabet
  data.sort((a, b) => {
    return a.municipality_name.localeCompare(b.municipality_name, 'no', { sensitivity: 'base' });
  });

  return data;
};
